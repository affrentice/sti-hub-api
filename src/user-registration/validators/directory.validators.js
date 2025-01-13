const { query, body, param, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const commonValidations = {
  pagination: (defaultLimit = 50, maxLimit = 500) => {
    return (req, res, next) => {
      const limit = parseInt(req.query.limit, 10);
      const skip = parseInt(req.query.skip, 10);
      req.query.limit =
        Number.isNaN(limit) || limit < 1
          ? defaultLimit
          : Math.min(limit, maxLimit);
      req.query.skip = Number.isNaN(skip) || skip < 0 ? 0 : skip;
      next();
    };
  },
  id: [
    param("id")
      .exists()
      .withMessage("ID is required")
      .isMongoId()
      .withMessage("Invalid ID format")
      .customSanitizer((value) => ObjectId(value)),
  ],
  type: [
    param("type")
      .exists()
      .withMessage("Directory type is required")
      .isIn(["investors", "financial-institutions", "bds-providers"])
      .withMessage("Invalid directory type"),
  ],
};

const directoryValidations = {
  searchInvestors: [
    ...commonValidations.type,
    query("sectors")
      .optional()
      .isArray()
      .withMessage("Sectors must be an array"),
    query("stages")
      .optional()
      .isIn(["idea", "startup", "growth", "established"])
      .withMessage("Invalid investment stage"),
    query("ticketSize")
      .optional()
      .isObject()
      .withMessage("Invalid ticket size format"),
    query("location").optional().isString().withMessage("Invalid location"),
  ],

  searchFinancialInstitutions: [
    query("serviceTypes")
      .optional()
      .isArray()
      .withMessage("Service types must be an array"),
    query("location").optional().isString().withMessage("Invalid location"),
    query("financingType")
      .optional()
      .isIn(["loan", "grant", "equity", "other"])
      .withMessage("Invalid financing type"),
  ],

  searchBDSProviders: [
    query("services")
      .optional()
      .isArray()
      .withMessage("Services must be an array"),
    query("category")
      .optional()
      .isIn(["consulting", "training", "mentoring", "technical", "other"])
      .withMessage("Invalid service category"),
    query("pricing")
      .optional()
      .isIn(["free", "paid", "negotiable"])
      .withMessage("Invalid pricing type"),
  ],

  connectionRequest: [
    ...commonValidations.type,
    ...commonValidations.id,
    body("message").optional().isString().withMessage("Invalid message format"),
  ],

  recommendation: [
    ...commonValidations.type,
    ...commonValidations.id,
    body("content")
      .exists()
      .withMessage("Recommendation content is required")
      .isString()
      .withMessage("Invalid recommendation format"),
  ],

  advancedSearch: [
    body("filters")
      .exists()
      .withMessage("Search filters are required")
      .isObject()
      .withMessage("Invalid filters format"),
    body("sortBy")
      .optional()
      .isIn(["rating", "experience", "connections"])
      .withMessage("Invalid sort criteria"),
  ],

  visibilityUpdate: [
    ...commonValidations.type,
    ...commonValidations.id,
    body("visibility")
      .exists()
      .withMessage("Visibility setting is required")
      .isIn(["public", "private", "connections"])
      .withMessage("Invalid visibility setting"),
  ],

  feedback: [
    ...commonValidations.type,
    ...commonValidations.id,
    body("rating")
      .exists()
      .withMessage("Rating is required")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isString().withMessage("Invalid comment format"),
  ],

  statsOperation: [
    ...commonValidations.type,
    query("timeframe")
      .optional()
      .isIn(["daily", "weekly", "monthly", "yearly"])
      .withMessage("Invalid timeframe"),
  ],

  exportOperation: [
    ...commonValidations.type,
    query("format")
      .optional()
      .isIn(["csv", "json", "pdf"])
      .withMessage("Invalid export format"),
  ],

  idOperation: [...commonValidations.id],
};

module.exports = {
  ...directoryValidations,
  pagination: commonValidations.pagination,
};
