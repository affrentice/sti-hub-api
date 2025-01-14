const GrantModel = require("@models/Grant");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const { isEmpty } = require("lodash");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- grant-util`);

const grant = {
  listGrants: async (request, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        sector,
        status,
        tenant,
      } = {
        ...request.query,
      };

      const query = { isActive: true };
      if (sector) query.sector = sector;
      if (status) query.status = status;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      };

      const grants = await GrantModel(tenant).paginate(query, options);

      return {
        success: true,
        message: "Grants retrieved successfully",
        data: grants.docs,
        pagination: {
          total: grants.totalDocs,
          page: grants.page,
          pages: grants.totalPages,
          limit: grants.limit,
        },
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  createGrant: async (request, next) => {
    try {
      const { tenant } = request.query;
      const grantData = {
        ...request.body,
        donor_id: request.user._id,
        donor_info: {
          name: request.user.name,
          email: request.user.email,
          organization: request.user.organization,
          last_updated: new Date(),
        },
      };

      const newGrant = await GrantModel(tenant).create(grantData);

      return {
        success: true,
        message: "Grant created successfully",
        data: newGrant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  updateGrant: async (request, next) => {
    try {
      const { grant_id } = request.params;
      const { tenant } = request.query;
      const updateData = {
        ...request.body,
        "donor_info.last_updated": new Date(),
      };

      const grant = await GrantModel(tenant).findById(grant_id);
      if (!grant) {
        throw new HttpError("Grant not found", httpStatus.NOT_FOUND);
      }

      if (grant.donor_id !== request.user._id) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedGrant = await GrantModel(tenant).findByIdAndUpdate(
        grant_id,
        updateData,
        { new: true }
      );

      return {
        success: true,
        message: "Grant updated successfully",
        data: updatedGrant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  getGrant: async (request, next) => {
    try {
      const { grant_id } = request.params;
      const { tenant } = request.query;

      const grant = await GrantModel(tenant).findOne({
        _id: grant_id,
        isActive: true,
      });

      if (!grant) {
        throw new HttpError("Grant not found", httpStatus.NOT_FOUND);
      }

      return {
        success: true,
        message: "Grant retrieved successfully",
        data: grant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  deleteGrant: async (request, next) => {
    try {
      const { grant_id } = request.params;
      const { tenant } = request.query;

      const grant = await GrantModel(tenant).findById(grant_id);
      if (!grant) {
        throw new HttpError("Grant not found", httpStatus.NOT_FOUND);
      }

      if (grant.donor_id !== request.user._id) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      // Soft delete by setting isActive to false
      const deletedGrant = await GrantModel(tenant).findByIdAndUpdate(
        grant_id,
        { isActive: false },
        { new: true }
      );

      return {
        success: true,
        message: "Grant deleted successfully",
        data: deletedGrant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  updateGrantStatus: async (request, next) => {
    try {
      const { grant_id } = request.params;
      const { status } = request.body;
      const { tenant } = request.query;

      const grant = await GrantModel(tenant).findById(grant_id);
      if (!grant) {
        throw new HttpError("Grant not found", httpStatus.NOT_FOUND);
      }

      if (grant.donor_id !== request.user._id) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedGrant = await GrantModel(tenant).findByIdAndUpdate(
        grant_id,
        {
          status,
          "donor_info.last_updated": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Grant status updated successfully",
        data: updatedGrant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  updateGrantDocuments: async (request, next) => {
    try {
      const { grant_id } = request.params;
      const { documents_required } = request.body;
      const { tenant } = request.query;

      const grant = await GrantModel(tenant).findById(grant_id);
      if (!grant) {
        throw new HttpError("Grant not found", httpStatus.NOT_FOUND);
      }

      if (grant.donor_id !== request.user._id) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedGrant = await GrantModel(tenant).findByIdAndUpdate(
        grant_id,
        {
          documents_required,
          "donor_info.last_updated": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Grant documents updated successfully",
        data: updatedGrant,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },
};

module.exports = grant;
