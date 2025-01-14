const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const constants = require("@config/constants");

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
  tenant: [
    query("tenant")
      .optional()
      .notEmpty()
      .withMessage("Tenant should not be empty if provided")
      .trim()
      .toLowerCase()
      .isIn(["sti"])
      .withMessage("The tenant value is not among the expected ones"),
  ],
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
  optionalArray: (field, validator) => [
    body(field)
      .optional()
      .custom((value) => Array.isArray(value))
      .withMessage(`The ${field} should be an array`)
      .bail()
      .notEmpty()
      .withMessage(`The ${field} should not be empty if provided`),
    body(`${field}.*`).custom(validator),
  ],
};

const departmentValidations = {
  tenant: commonValidations.tenant,
  departmentId: commonValidations.mongoId("department_id"),
  groupId: commonValidations.mongoId("dep_group_id", "body"),

  title: [
    body("dep_title")
      .exists()
      .withMessage("Department title is required")
      .trim()
      .notEmpty()
      .withMessage("Department title cannot be empty")
      .isLength({ min: 2, max: 100 })
      .withMessage("Department title must be between 2 and 100 characters"),
  ],

  description: [
    body("dep_description")
      .exists()
      .withMessage("Department description is required")
      .trim()
      .notEmpty()
      .withMessage("Department description cannot be empty")
      .isLength({ min: 10, max: 500 })
      .withMessage(
        "Department description must be between 10 and 500 characters"
      ),
  ],

  status: [
    body("dep_status")
      .exists()
      .withMessage("Department status is required")
      .trim()
      .isIn(["active", "inactive"])
      .withMessage("Department status must be either 'active' or 'inactive'"),
  ],

  manager: [
    body("dep_manager")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid manager ID format")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("dep_manager_username")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Manager username cannot be empty if provided"),
    body("dep_manager_firstname")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Manager first name cannot be empty if provided"),
    body("dep_manager_lastname")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Manager last name cannot be empty if provided"),
  ],

  parent: [
    body("dep_parent")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid parent department ID format")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],

  users: commonValidations.optionalArray("dep_users", (value) => {
    if (!value || !mongoose.Types.ObjectId.isValid(value)) {
      throw new Error("Invalid user ID format in department users array");
    }
    return true;
  }),

  create: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("dep_group_id", "body"),
  ],

  update: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("department_id"),
  ],

  list: [
    ...commonValidations.tenant,
    query("dep_group_id")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid group ID format")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    query("dep_parent")
      .optional()
      .trim()
      .isMongoId()
      .withMessage("Invalid parent department ID format")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    query("dep_status")
      .optional()
      .trim()
      .isIn(["active", "inactive"])
      .withMessage("Invalid department status"),
  ],
};

module.exports = {
  ...departmentValidations,
  middlewareUtils,
  commonValidations,
};
