const { UserModel } = require("@models/User");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- directory-util`);
const { HttpError } = require("@utils/shared");
const { mailer } = require("@utils/common");

const directory = {
  // Investor Directory Operations
  listInvestors: async (request, next) => {
    try {
      const { filters, sort, page, limit, tenant } = {
        ...request.query,
        ...request.params,
      };

      const query = {
        userType: "investor",
        status: "active",
        ...filters,
      };

      const investors = await UserModel(tenant)
        .find(query)
        .select("-password")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("portfolio.company", "business.name business.sector");

      return investors;
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

  getInvestorDetails: async (request, next) => {
    try {
      const { id, tenant } = {
        ...request.params,
        ...request.query,
      };

      const investor = await UserModel(tenant)
        .findOne({ _id: id, userType: "investor" })
        .select("-password")
        .populate("portfolio.company", "business.name business.sector");

      if (!investor) {
        throw new HttpError("Investor not found", httpStatus.NOT_FOUND);
      }

      return investor;
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          error.message || "Internal Server Error",
          error.status || httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  },

  // BDS Provider Directory Operations
  listBDSProviders: async (request, next) => {
    try {
      const { filters, sort, page, limit, tenant } = {
        ...request.query,
        ...request.params,
      };

      const query = {
        userType: "bdsProvider",
        status: "active",
        ...filters,
      };

      const bdsProviders = await UserModel(tenant)
        .find(query)
        .select("-password")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("clientele", "business.name business.sector");

      return bdsProviders;
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

  getBDSProviderServices: async (request, next) => {
    try {
      const { id, tenant } = {
        ...request.params,
        ...request.query,
      };

      const bdsProvider = await UserModel(tenant)
        .findOne({ _id: id, userType: "bdsProvider" })
        .select("services");

      if (!bdsProvider) {
        throw new HttpError("BDS Provider not found", httpStatus.NOT_FOUND);
      }

      return bdsProvider.services;
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          error.message || "Internal Server Error",
          error.status || httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  },

  // Connection Management
  createConnection: async (request, next) => {
    try {
      const { type, id, user, tenant } = {
        ...request.body,
        ...request.params,
        ...request.query,
      };

      const connectionField =
        type === "investor" ? "connectedInvestors" : "connectedBDSProviders";

      const entrepreneur = await UserModel(tenant).findOneAndUpdate(
        { _id: user._id, userType: "entrepreneur" },
        { $addToSet: { [connectionField]: id } },
        { new: true }
      );

      if (!entrepreneur) {
        throw new HttpError("Operation failed", httpStatus.BAD_REQUEST);
      }

      // Send email notification
      await mailer.sendConnectionNotification(user.email, type);

      return entrepreneur;
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          error.message || "Internal Server Error",
          error.status || httpStatus.INTERNAL_SERVER_ERROR
        )
      );
    }
  },

  // Advanced Search
  advancedSearch: async (request, next) => {
    try {
      const { searchParams, userType, tenant } = {
        ...request.body,
        ...request.query,
      };

      const query = {
        userType,
        status: "active",
      };

      // Build search query based on userType
      switch (userType) {
        case "investor":
          if (searchParams.sectors) {
            query["investmentPreferences.sectors"] = {
              $in: searchParams.sectors,
            };
          }
          if (searchParams.stages) {
            query["investmentPreferences.stages"] = {
              $in: searchParams.stages,
            };
          }
          break;

        case "bdsProvider":
          if (searchParams.services) {
            query["services.category"] = { $in: searchParams.services };
          }
          break;
      }

      const results = await UserModel(tenant)
        .find(query)
        .select("-password")
        .limit(searchParams.limit || 10);

      return results;
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

  // Directory Statistics
  getDirectoryStats: async (request, next) => {
    try {
      const { type, tenant } = {
        ...request.params,
        ...request.query,
      };

      const stats = await UserModel(tenant).aggregate([
        { $match: { userType: type, status: "active" } },
        {
          $group: {
            _id: null,
            totalCount: { $sum: 1 },
            averageLoginCount: { $avg: "$loginCount" },
            verifiedCount: {
              $sum: { $cond: [{ $eq: ["$verified", true] }, 1, 0] },
            },
          },
        },
      ]);

      return stats[0] || {};
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

module.exports = directory;
