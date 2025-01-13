const { query, body, param } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const commonValidations = {
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
  pagination: (defaultLimit = 100, maxLimit = 1000) => {
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
};
const permissionValidations = {
  list: [...commonValidations.tenant],
  create: [
    ...commonValidations.tenant,
    body("permission")
      .exists()
      .withMessage("permission is missing in your request")
      .bail()
      .notEmpty()
      .withMessage("the permission must not be empty")
      .bail()
      .trim()
      .escape()
      .customSanitizer((value) => {
        const sanitizedValue = value.replace(/[^a-zA-Z]/g, " ");
        return sanitizedValue.toUpperCase().replace(/ /g, "_");
      }),
    body("network_id")
      .optional()
      .notEmpty()
      .withMessage("network_id should not be empty if provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("network_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("group_id")
      .optional()
      .notEmpty()
      .withMessage("group_id should not be empty if provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("group_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("description")
      .exists()
      .withMessage("description is missing in your request")
      .bail()
      .notEmpty()
      .withMessage("the description must not be empty")
      .trim(),
  ],
  update: [
    ...commonValidations.tenant,
    param("permission_id")
      .exists()
      .withMessage("the permission_id param is missing in the request")
      .bail()
      .trim(),
    body("permission")
      .not()
      .exists()
      .withMessage("permission should not exist in the request body"),
    body("network_id")
      .optional()
      .notEmpty()
      .withMessage("network_id should not be empty if provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("network_id must be an object ID")
      .customSanitizer((value) => ObjectId(value)),
    body("description")
      .optional()
      .notEmpty()
      .withMessage("description should not be empty if provided")
      .trim(),
  ],
  delete: [...commonValidations.tenant],
  checkEmptyBody: (req, res, next) => {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ errors: "request body is empty" });
    }
    next();
  },
};
module.exports = {
  ...permissionValidations,
  pagination: commonValidations.pagination,
};
