const httpStatus = require("http-status");
const createMaintenanceUtil = require("@utils/maintenance.util");
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- maintenances-controller`
);
const {
  logObject,
  logText,
  logElement,
  HttpError,
  extractErrorsFromRequest,
} = require("@utils/shared");
const { responseHandler } = require("@utils/common");

const maintenances = {
  update: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }
      const result = await createMaintenanceUtil.update(req, next);

      if (isEmpty(result) || res.headersSent) {
        return;
      }
      responseHandler(res, result, "maintenance");
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: "An unexpected error occurred." }
        )
      );
      return;
    }
  },
  create: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }
      const result = await createMaintenanceUtil.create(req, next);

      if (isEmpty(result) || res.headersSent) {
        return;
      }
      responseHandler(res, result, "maintenance");
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: "An unexpected error occurred." }
        )
      );
      return;
    }
  },
  list: async (req, res, next) => {
    try {
      logText(".....................................");
      logText("list all maintenances by query params provided");
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }
      const result = await createMaintenanceUtil.list(req, next);

      if (isEmpty(result) || res.headersSent) {
        return;
      }
      responseHandler(res, result, "maintenance");
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: "An unexpected error occurred." }
        )
      );
      return;
    }
  },
  delete: async (req, res, next) => {
    try {
      logText("deleting maintenance..........");
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await createMaintenanceUtil.delete(req, next);

      if (isEmpty(result) || res.headersSent) {
        return;
      }
      responseHandler(res, result, "maintenance");
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: "An unexpected error occurred." }
        )
      );
      return;
    }
  },
};

module.exports = maintenances;
