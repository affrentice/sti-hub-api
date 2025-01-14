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

const researchValidations = {
  publicationId: commonValidations.mongoId("publication_id"),

  title: [
    body("title")
      .exists()
      .withMessage("Research title is required")
      .trim()
      .notEmpty()
      .withMessage("Research title cannot be empty")
      .isLength({ min: 5, max: 200 })
      .withMessage("Research title must be between 5 and 200 characters"),
  ],

  abstract: [
    body("abstract")
      .exists()
      .withMessage("Research abstract is required")
      .trim()
      .notEmpty()
      .withMessage("Research abstract cannot be empty")
      .isLength({ min: 100, max: 5000 })
      .withMessage("Research abstract must be between 100 and 5000 characters"),
  ],

  keywords: [
    body("keywords")
      .isArray()
      .withMessage("Keywords must be an array")
      .notEmpty()
      .withMessage("At least one keyword is required"),
    body("keywords.*")
      .trim()
      .notEmpty()
      .withMessage("Keywords cannot be empty"),
  ],

  status: [
    body("status")
      .exists()
      .withMessage("Publication status is required")
      .trim()
      .isIn(["published", "under_review", "draft"])
      .withMessage("Invalid publication status"),
  ],

  accessLevel: [
    body("access_level")
      .exists()
      .withMessage("Access level is required")
      .trim()
      .isIn(["public", "private", "institutional"])
      .withMessage("Invalid access level"),
  ],

  list: [
    query("research_area")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Research area cannot be empty if provided"),
    query("status")
      .optional()
      .trim()
      .isIn(["published", "under_review", "draft"])
      .withMessage("Invalid status filter"),
    query("access_level")
      .optional()
      .trim()
      .isIn(["public", "private", "institutional"])
      .withMessage("Invalid access level filter"),
  ],
};

module.exports = {
  researchValidations,
  middlewareUtils,
  commonValidations,
};
