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

const grantApplicationValidations = {
  applicationId: commonValidations.mongoId("application_id"),

  grantId: commonValidations.mongoId("grant_id", "body"),

  create: [
    body("applicant_id")
      .exists()
      .withMessage("Applicant ID is required")
      .trim()
      .notEmpty()
      .withMessage("Applicant ID cannot be empty"),
  ],

  applicantInfo: [
    body("applicant_info.name")
      .exists()
      .withMessage("Applicant name is required")
      .trim()
      .notEmpty()
      .withMessage("Applicant name cannot be empty"),
    body("applicant_info.email")
      .exists()
      .withMessage("Email is required")
      .trim()
      .isEmail()
      .withMessage("Invalid email format"),
    body("applicant_info.organization")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Organization name cannot be empty if provided"),
  ],

  update: [
    body("applicant_info")
      .optional()
      .isObject()
      .withMessage("Applicant info must be an object"),
    body("applicant_info.name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty if provided"),
    body("applicant_info.email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Invalid email format"),
    body("applicant_info.organization")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Organization cannot be empty if provided"),
  ],

  status: [
    body("status")
      .exists()
      .withMessage("Application status is required")
      .trim()
      .isIn(["submitted", "under_review", "approved", "rejected"])
      .withMessage("Invalid application status"),
  ],

  documents: [
    body("documents").isArray().withMessage("Documents must be an array"),
    body("documents.*.title")
      .exists()
      .withMessage("Document title is required")
      .trim()
      .notEmpty()
      .withMessage("Document title cannot be empty"),
    body("documents.*.url")
      .exists()
      .withMessage("Document URL is required")
      .trim()
      .isURL()
      .withMessage("Invalid document URL"),
  ],

  reviewNotes: [
    body("note")
      .exists()
      .withMessage("Review note is required")
      .trim()
      .notEmpty()
      .withMessage("Review note cannot be empty"),
    body("reviewer_id")
      .exists()
      .withMessage("Reviewer ID is required")
      .isMongoId()
      .withMessage("Invalid reviewer ID format"),
    body("reviewer_info")
      .exists()
      .withMessage("Reviewer info is required")
      .isObject()
      .withMessage("Reviewer info must be an object"),
    body("reviewer_info.name")
      .exists()
      .withMessage("Reviewer name is required")
      .trim()
      .notEmpty()
      .withMessage("Reviewer name cannot be empty"),
    body("reviewer_info.role")
      .exists()
      .withMessage("Reviewer role is required")
      .trim()
      .notEmpty()
      .withMessage("Reviewer role cannot be empty"),
  ],

  list: [
    query("status")
      .optional()
      .trim()
      .isIn(["submitted", "under_review", "approved", "rejected"])
      .withMessage("Invalid status filter"),
    query("grant_id")
      .optional()
      .isMongoId()
      .withMessage("Invalid grant ID format"),
  ],
};

module.exports = {
  grantApplicationValidations,
  middlewareUtils,
  commonValidations,
};
