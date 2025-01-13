const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
// Common validation patterns
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
    location === "param"
      ? param(field)
      : body(field)
          .exists()
          .withMessage(`The ${field} is missing in request`)
          .bail()
          .notEmpty()
          .withMessage(`The ${field} should not be empty`)
          .bail()
          .trim()
          .isMongoId()
          .withMessage(`${field} must be an object ID`)
          .bail()
          .customSanitizer((value) => ObjectId(value)),
  ],
  arrayField: (field, minLength = 1) => [
    body(field)
      .exists()
      .withMessage(`The ${field} array must be provided`)
      .bail()
      .isArray({ min: minLength })
      .withMessage(`At least ${minLength} ${field} item is required`)
      .bail()
      .custom((items) => {
        if (!Array.isArray(items)) {
          throw new Error(`${field} must be an array`);
        }
        return true;
      }),
  ],
};
// Specific validations using common patterns
const checklistValidations = {
  tenant: commonValidations.tenant,
  userId: commonValidations.mongoId("user_id"),
  items: commonValidations.arrayField("items"),

  // Grouped validations for common operations
  create: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("user_id"),
    ...commonValidations.arrayField("items"),
  ],

  update: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("user_id"),
    ...commonValidations.arrayField("items"),
  ],

  list: [...commonValidations.tenant, ...commonValidations.mongoId("user_id")],

  delete: [
    ...commonValidations.tenant,
    ...commonValidations.mongoId("user_id"),
  ],
};
module.exports = {
  ...checklistValidations,
  commonValidations,
};
