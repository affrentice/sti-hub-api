const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const middlewareUtils = {
  pagination: (req, res, next) => {
    const limit = parseInt(req.query.limit, 10);
    const skip = parseInt(req.query.skip, 10);
    req.query.limit = Number.isNaN(limit) || limit < 1 ? 100 : limit;
    req.query.skip = Number.isNaN(skip) || skip < 0 ? 0 : skip;
    next();
  },
  headers: (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    next();
  },
};

const commonValidations = {
  mongoId: (field, location = "param") => [
    (location === "param" ? param(field) : body(field))
      .exists()
      .withMessage(`The ${field} is missing in the request`)
      .bail()
      .trim()
      .isMongoId()
      .withMessage(`${field} must be an object ID`)
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
};

// Grant validators
const grantValidations = {
  grantId: commonValidations.mongoId("grant_id"),

  title: [
    body("title")
      .exists()
      .withMessage("Grant title is required")
      .trim()
      .notEmpty()
      .withMessage("Grant title cannot be empty")
      .isLength({ min: 5, max: 200 })
      .withMessage("Grant title must be between 5 and 200 characters"),
  ],

  amount: [
    body("amount")
      .exists()
      .withMessage("Grant amount is required")
      .isNumeric()
      .withMessage("Grant amount must be a number")
      .isFloat({ min: 0 })
      .withMessage("Grant amount must be greater than 0"),
  ],

  deadline: [
    body("application_deadline")
      .exists()
      .withMessage("Application deadline is required")
      .isISO8601()
      .withMessage("Invalid date format for application deadline")
      .custom((value) => {
        if (new Date(value) <= new Date()) {
          throw new Error("Application deadline must be in the future");
        }
        return true;
      }),
  ],

  status: [
    body("status")
      .exists()
      .withMessage("Grant status is required")
      .trim()
      .isIn(["active", "closed", "draft"])
      .withMessage("Invalid grant status"),
  ],

  list: [
    query("sector")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Sector cannot be empty if provided"),
    query("status")
      .optional()
      .trim()
      .isIn(["active", "closed", "draft"])
      .withMessage("Invalid status filter"),
  ],
};

module.exports = {
  grantValidations,
  middlewareUtils,
  commonValidations,
};
