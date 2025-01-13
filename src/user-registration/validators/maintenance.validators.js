const { query, body, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isEmpty = require("is-empty");

const commonValidations = {
  pagination: (defaultLimit = 100) => {
    return (req, res, next) => {
      const limit = parseInt(req.query.limit, 10);
      const skip = parseInt(req.query.skip, 10);
      req.query.limit = Number.isNaN(limit) || limit < 1 ? defaultLimit : limit;
      req.query.skip = Number.isNaN(skip) || skip < 0 ? 0 : skip;
      next();
    };
  },
  tenant: [
    query("tenant")
      .optional()
      .notEmpty()
      .withMessage("tenant should not be empty if provided")
      .trim()
      .toLowerCase()
      .bail()
      .isIn(["sti"])
      .withMessage("the tenant value is not among the expected ones"),
  ],
  mongoId: [
    query("id")
      .optional()
      .isMongoId()
      .withMessage("id must be a valid ObjectId"),
  ],
};

const maintenanceValidations = {
  createMaintenance: [
    oneOf([commonValidations.tenant]),
    oneOf([
      body("startDate")
        .optional()
        .notEmpty()
        .withMessage("startDate should not be empty if provided")
        .bail()
        .trim()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage("startDate must be a valid datetime."),
    ]),
    oneOf([
      body("endDate")
        .optional()
        .notEmpty()
        .withMessage("endDate should not be empty if provided")
        .bail()
        .trim()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage("endDate must be a valid datetime."),
    ]),
    oneOf([
      body("isActive")
        .optional()
        .notEmpty()
        .withMessage("isActive should not be empty if provided")
        .bail()
        .isBoolean()
        .withMessage("isActive must be Boolean"),
    ]),
    oneOf([
      body("message")
        .optional()
        .notEmpty()
        .withMessage("message should not be empty if provided")
        .trim(),
    ]),
  ],

  updateMaintenance: [
    oneOf([commonValidations.tenant]),
    oneOf([
      body("startDate")
        .optional()
        .notEmpty()
        .withMessage("startDate should not be empty if provided")
        .bail()
        .trim()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage("startDate must be a valid datetime."),
    ]),
    oneOf([
      body("endDate")
        .optional()
        .notEmpty()
        .withMessage("endDate should not be empty if provided")
        .bail()
        .trim()
        .isISO8601({ strict: true, strictSeparator: true })
        .withMessage("endDate must be a valid datetime."),
    ]),
    oneOf([
      body("isActive")
        .optional()
        .notEmpty()
        .withMessage("isActive should not be empty if provided")
        .bail()
        .isBoolean()
        .withMessage("isActive must be Boolean"),
    ]),
    oneOf([
      body("message")
        .optional()
        .notEmpty()
        .withMessage("message should not be empty if provided")
        .trim(),
    ]),
  ],

  listMaintenance: [
    oneOf([commonValidations.tenant]),
    ...commonValidations.mongoId,
  ],

  deleteMaintenance: [
    oneOf([commonValidations.tenant]),
    ...commonValidations.mongoId,
  ],
};

module.exports = {
  ...maintenanceValidations,
  pagination: commonValidations.pagination,
};
