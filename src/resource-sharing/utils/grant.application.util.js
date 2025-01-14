const GrantApplicationModel = require("@models/GrantApplication");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const { isEmpty } = require("lodash");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- grant-application-util`
);

const grantApplication = {
  listApplications: async (request, next) => {
    try {
      const { status, grant_id, tenant, limit, skip } = {
        ...request.query,
      };

      const query = {};
      if (status) query.status = status;
      if (grant_id) query.grant_id = grant_id;

      const applications = await GrantApplicationModel(tenant)
        .find(query)
        .limit(limit)
        .skip(skip)
        .sort({ createdAt: -1 });

      const count = await GrantApplicationModel(tenant).countDocuments(query);

      return {
        success: true,
        message: "Applications retrieved successfully",
        data: applications,
        count,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  createApplication: async (request, next) => {
    try {
      const { grant_id, applicant_info, documents, tenant } = {
        ...request.body,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant).create({
        grant_id,
        applicant_id: request.user._id,
        applicant_info,
        documents,
        status: "submitted",
      });

      return {
        success: true,
        message: "Application submitted successfully",
        data: application,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  updateApplication: async (request, next) => {
    try {
      const { application_id, documents, tenant } = {
        ...request.body,
        ...request.params,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant).findById(
        application_id
      );
      if (!application) {
        throw new HttpError("Application not found", httpStatus.NOT_FOUND);
      }

      // Only allow updates if application is not already approved/rejected
      if (["approved", "rejected"].includes(application.status)) {
        throw new HttpError(
          "Cannot update approved or rejected applications",
          httpStatus.BAD_REQUEST
        );
      }

      const updatedApplication = await GrantApplicationModel(
        tenant
      ).findByIdAndUpdate(application_id, { documents }, { new: true });

      return {
        success: true,
        message: "Application updated successfully",
        data: updatedApplication,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  getApplication: async (request, next) => {
    try {
      const { application_id, tenant } = {
        ...request.params,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant)
        .findById(application_id)
        .populate("grant_id");

      if (!application) {
        throw new HttpError("Application not found", httpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: "Application retrieved successfully",
        data: application,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  updateApplicationStatus: async (request, next) => {
    try {
      const { application_id, status, tenant } = {
        ...request.body,
        ...request.params,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant).findById(
        application_id
      );
      if (!application) {
        throw new HttpError("Application not found", httpStatus.NOT_FOUND);
      }

      // Validate status transition
      const validTransitions = {
        submitted: ["under_review", "rejected"],
        under_review: ["approved", "rejected"],
        approved: [],
        rejected: [],
      };

      if (!validTransitions[application.status].includes(status)) {
        throw new HttpError(
          `Invalid status transition from ${application.status} to ${status}`,
          httpStatus.BAD_REQUEST
        );
      }

      const updatedApplication = await GrantApplicationModel(
        tenant
      ).findByIdAndUpdate(application_id, { status }, { new: true });

      return {
        success: true,
        message: "Application status updated successfully",
        data: updatedApplication,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  addReviewNotes: async (request, next) => {
    try {
      const { application_id, note, reviewer_id, reviewer_info, tenant } = {
        ...request.body,
        ...request.params,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant).findById(
        application_id
      );
      if (!application) {
        throw new HttpError("Application not found", httpStatus.NOT_FOUND);
      }

      // Only allow review notes for applications under review
      if (application.status !== "under_review") {
        throw new HttpError(
          "Review notes can only be added to applications under review",
          httpStatus.BAD_REQUEST
        );
      }

      const reviewNote = {
        note,
        reviewer_id,
        reviewer_info,
        created_at: new Date(),
      };

      const updatedApplication = await GrantApplicationModel(
        tenant
      ).findByIdAndUpdate(
        application_id,
        { $push: { review_notes: reviewNote } },
        { new: true }
      );

      return {
        success: true,
        message: "Review notes added successfully",
        data: updatedApplication,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  uploadDocuments: async (request, next) => {
    try {
      const { application_id, documents, tenant } = {
        ...request.body,
        ...request.params,
        ...request.query,
      };

      const application = await GrantApplicationModel(tenant).findById(
        application_id
      );
      if (!application) {
        throw new HttpError("Application not found", httpStatus.NOT_FOUND);
      }

      // Only allow document uploads for applications that aren't approved/rejected
      if (["approved", "rejected"].includes(application.status)) {
        throw new HttpError(
          "Cannot upload documents to approved or rejected applications",
          httpStatus.BAD_REQUEST
        );
      }

      // Add upload timestamp to each document
      const documentsWithTimestamp = documents.map((doc) => ({
        ...doc,
        uploaded_at: new Date(),
      }));

      const updatedApplication = await GrantApplicationModel(
        tenant
      ).findByIdAndUpdate(
        application_id,
        { $push: { documents: { $each: documentsWithTimestamp } } },
        { new: true }
      );

      return {
        success: true,
        message: "Documents uploaded successfully",
        data: updatedApplication,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
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

module.exports = grantApplication;
