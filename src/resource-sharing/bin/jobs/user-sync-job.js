const cron = require("node-cron");
const GrantApplicationModel = require("@models/GrantApplication");
const ResearchPublicationModel = require("@models/ResearchPublication");
const GrantModel = require("@models/Grant");
const constants = require("@config/constants");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- bin/jobs/user-sync-job`
);
const { stringify } = require("@utils/common");
const UserServiceClient = require("@config/userServiceClient");

const userServiceClient = new UserServiceClient();
const CACHE_THRESHOLD = constants.USER_CACHE_THRESHOLD || 86400000; // 24 hours
const BATCH_SIZE = 50; // Optimized for bulk API requests

// Define required fields for each model type
const MODEL_FIELD_MAPPINGS = {
  grant: "firstName,lastName,email,userType,status,organization",
  research: "firstName,lastName,email,institution,status",
  application: "firstName,lastName,email,organization,status",
};

const syncUserData = async () => {
  try {
    const models = [
      {
        model: GrantModel("sti"),
        userField: "donor_id",
        infoField: "donor_info",
        type: "grant",
      },
      {
        model: ResearchPublicationModel("sti"),
        userField: "author_id",
        infoField: "author_info",
        type: "research",
      },
      {
        model: GrantApplicationModel("sti"),
        userField: "applicant_id",
        infoField: "applicant_info",
        type: "application",
      },
    ];

    for (const { model, userField, infoField, type } of models) {
      let skip = 0;
      let totalProcessed = 0;
      let startTime = Date.now();

      while (true) {
        // Find records with stale user data
        const records = await model
          .find({
            $or: [
              {
                [`${infoField}.last_updated`]: {
                  $lt: new Date(Date.now() - CACHE_THRESHOLD),
                },
              },
              {
                [`${infoField}.last_updated`]: null,
              },
            ],
          })
          .limit(BATCH_SIZE)
          .skip(skip)
          .select(`${userField} _id`)
          .lean();

        if (records.length === 0) break;

        const userIds = [
          ...new Set(records.map((record) => record[userField])),
        ];

        try {
          // Fetch user data in bulk with specific fields
          const usersMap = await userServiceClient.getUsersBulk(
            userIds,
            MODEL_FIELD_MAPPINGS[type]
          );

          // Prepare bulk write operations
          const bulkOps = records
            .filter((record) => usersMap.has(record[userField]))
            .map((record) => {
              const userData = usersMap.get(record[userField]);
              return {
                updateOne: {
                  filter: { _id: record._id },
                  update: {
                    $set: {
                      [infoField]: {
                        name: `${userData.firstName} ${userData.lastName}`,
                        email: userData.email,
                        organization:
                          userData.organization || userData.institution,
                        userType: userData.userType,
                        status: userData.status,
                        last_updated: new Date(),
                      },
                    },
                  },
                },
              };
            });

          if (bulkOps.length > 0) {
            const result = await model.bulkWrite(bulkOps, { ordered: false });
            totalProcessed += result.modifiedCount;
            logger.info(
              `Batch processed for ${model.modelName}: ${result.modifiedCount} records updated`
            );
          }
        } catch (error) {
          if (error.response?.status === 400) {
            logger.error(
              `Invalid user IDs in batch: ${stringify(error.response.data)}`
            );
          } else {
            logger.error(
              `Failed to sync batch at skip ${skip}: ${stringify(error)}`
            );
          }
        }

        skip += BATCH_SIZE;
      }

      const duration = (Date.now() - startTime) / 1000;
      logger.info(
        `Sync completed for ${model.modelName}: ${totalProcessed} records updated in ${duration}s`
      );
    }
  } catch (error) {
    logger.error(`User sync job failed: ${stringify(error)}`);
  }
};

// Run job every day at 1 AM
const schedule = "0 1 * * *";
cron.schedule(schedule, syncUserData, {
  scheduled: true,
  timezone: "Africa/Nairobi",
});

// Add manual trigger endpoint for admin use
const triggerSync = async (req, res) => {
  try {
    // Run in background to avoid request timeout
    syncUserData().catch((error) =>
      logger.error(`Manual sync failed: ${stringify(error)}`)
    );

    return res.status(200).json({
      success: true,
      message: "Sync job triggered successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to trigger sync job",
      error: error.message,
    });
  }
};

module.exports = {
  syncUserData,
  UserServiceClient,
  triggerSync,
};