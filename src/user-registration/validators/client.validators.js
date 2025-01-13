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
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
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
const clientValidations = {
  tenant: commonValidations.tenant,
  userId: commonValidations.mongoId("user_id", "body"),
  clientId: commonValidations.mongoId("client_id"),

  name: [
    body("name")
      .exists()
      .withMessage("The name is missing in your request")
      .trim(),
  ],

  ipAddress: [
    body("ip_address")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("The ip_address must not be empty if provided")
      .bail()
      .isIP()
      .withMessage("Invalid IP address"),
  ],

  ipAddresses: commonValidations.optionalArray("ip_addresses", (value) => {
    if (!value || !value.isIP()) {
      throw new Error("Invalid IP address provided");
    }
    return true;
  }),

  redirectUrl: [
    body("redirect_url")
      .optional()
      .notEmpty()
      .withMessage("The redirect_url cannot be empty if provided")
      .bail()
      .trim()
      .matches(constants.WHITE_SPACES_REGEX, "i")
      .withMessage("The redirect_url cannot have spaces in it")
      .bail()
      .isURL()
      .withMessage("The redirect_url is not a valid URL")
      .trim(),
  ],

  isActive: [
    body("isActive")
      .exists()
      .withMessage("isActive field is missing")
      .bail()
      .notEmpty()
      .withMessage("isActive should not be empty if provided")
      .bail()
      .isBoolean()
      .withMessage("isActive should be a Boolean value"),
  ],
  create: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("user_id", "body"),
  ],

  update: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("client_id"),
  ],

  list: [...commonValidations.tenant],
};
module.exports = {
  ...clientValidations,
  middlewareUtils,
  commonValidations,
};
