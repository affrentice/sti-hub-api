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

const grantValidations = {
  grantId: commonValidations.mongoId("grant_id"),

  create: [
    body("donor_id")
      .exists()
      .withMessage("Donor ID is required")
      .trim()
      .notEmpty()
      .withMessage("Donor ID cannot be empty"),
  ],

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

  description: [
    body("description")
      .exists()
      .withMessage("Grant description is required")
      .trim()
      .notEmpty()
      .withMessage("Grant description cannot be empty")
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters long"),
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

  eligibilityCriteria: [
    body("eligibility_criteria")
      .exists()
      .withMessage("Eligibility criteria is required")
      .isArray()
      .withMessage("Eligibility criteria must be an array")
      .notEmpty()
      .withMessage("At least one eligibility criterion is required"),
    body("eligibility_criteria.*")
      .trim()
      .notEmpty()
      .withMessage("Eligibility criteria items cannot be empty"),
  ],

  sector: [
    body("sector")
      .exists()
      .withMessage("Sector is required")
      .trim()
      .notEmpty()
      .withMessage("Sector cannot be empty"),
  ],

  applicationProcess: [
    body("application_process")
      .exists()
      .withMessage("Application process is required")
      .trim()
      .notEmpty()
      .withMessage("Application process cannot be empty")
      .isLength({ min: 20 })
      .withMessage("Application process must be at least 20 characters long"),
  ],

  documentsRequired: [
    body("documents_required")
      .exists()
      .withMessage("Documents required field is required")
      .isArray()
      .withMessage("Documents required must be an array"),
    body("documents_required.*")
      .trim()
      .notEmpty()
      .withMessage("Document required items cannot be empty"),
  ],

  status: [
    body("status")
      .exists()
      .withMessage("Grant status is required")
      .trim()
      .isIn(["active", "closed", "draft"])
      .withMessage("Invalid grant status"),
  ],

  update: [
    body("donor_info")
      .optional()
      .isObject()
      .withMessage("Donor info must be an object"),
    body("donor_info.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Donor name cannot be empty if provided"),
    body("donor_info.email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format"),
    body("donor_info.organization")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Organization cannot be empty if provided"),
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
