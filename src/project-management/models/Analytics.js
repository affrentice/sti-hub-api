const mongoose = require("mongoose").set("debug", true);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- analytics-model`);
const { getModelByTenant } = require("@config/database");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");
const {
  mailer,
  stringify,
  date,
  msgs,
  emailTemplates,
  generateFilter,
  winstonLogger,
  responseHandler,
} = require("@utils/common");

const AnalyticsEventSchema = new Schema(
  {
    user_id: {
      type: String,
      required: [true, "User ID is required!"],
      index: true,
    },
    user_info: {
      name: String,
      email: String,
      organization: String,
      last_updated: Date,
    },
    event_type: {
      type: String,
      required: [true, "Event type is required!"],
      enum: [
        "login",
        "connection_made",
        "resource_access",
        "project_update",
        "message_sent",
      ],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    platform: {
      type: String,
      enum: ["web", "mobile", "api"],
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Analytics Methods
AnalyticsEventSchema.statics = {
  async getEngagementMetrics({ startDate, endDate, eventType } = {}, next) {
    try {
      const filter = {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (eventType) {
        filter.event_type = eventType;
      }

      const metrics = await this.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              eventType: "$event_type",
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);

      return {
        success: true,
        data: metrics,
        status: httpStatus.OK,
      };
    } catch (error) {
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
};

// Model creation with tenant support
const AnalyticsModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let analytics = mongoose.model("analytics_events");
    return analytics;
  } catch (error) {
    let analytics = getModelByTenant(
      dbTenant,
      "analytics_event",
      AnalyticsEventSchema
    );
    return analytics;
  }
};

module.exports = AnalyticsModel;
