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
  roleId: [
    param("role_id")
      .exists()
      .withMessage("the role ID param is missing in the request")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the role ID must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  userId: [
    param("user_id")
      .exists()
      .withMessage("the user ID param is missing in the request")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the user ID must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  permissionId: [
    param("permission_id")
      .exists()
      .withMessage("the permission ID param is missing in the request")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the permission ID must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
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

const roleValidations = {
  list: [
    ...commonValidations.tenant,
    query("network_id")
      .optional()
      .notEmpty()
      .withMessage("network_id must not be empty if provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("network_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    query("group_id")
      .optional()
      .notEmpty()
      .withMessage("group_id must not be empty if provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("group_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  create: [
    ...commonValidations.tenant,
    body("network_id")
      .exists()
      .withMessage("the organisation identifier is missing in request")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("network_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("role_code")
      .optional()
      .notEmpty()
      .withMessage("role_code should not be empty IF provided")
      .bail()
      .trim()
      .escape()
      .customSanitizer((value) => value.replace(/ /g, "_").toUpperCase()),
    body("role_name")
      .exists()
      .withMessage("role_name is missing in your request")
      .bail()
      .notEmpty()
      .withMessage("the role_name must not be empty")
      .bail()
      .trim()
      .escape()
      .customSanitizer((value) => value.replace(/ /g, "_").toUpperCase()),
    body("role_status")
      .optional()
      .notEmpty()
      .withMessage("role_status must not be empty if provided")
      .bail()
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("the role_status value must be ACTIVE or INACTIVE")
      .trim(),
  ],
  update: [
    ...commonValidations.tenant,
    ...commonValidations.roleId,
    body("role_status")
      .optional()
      .notEmpty()
      .withMessage("role_status should not be empty if provided")
      .bail()
      .isIn(["ACTIVE", "INACTIVE"])
      .withMessage("role_status must be ACTIVE or INACTIVE")
      .trim(),
  ],
  assignUsers: [
    ...commonValidations.tenant,
    ...commonValidations.roleId,
    body("user_ids")
      .exists()
      .withMessage("user_ids are missing in request body")
      .bail()
      .isArray()
      .withMessage("user_ids must be an array")
      .bail()
      .notEmpty()
      .withMessage("user_ids cannot be empty"),
    body("user_ids.*")
      .isMongoId()
      .withMessage("each user_id must be a valid ObjectId"),
  ],
  assignPermissions: [
    ...commonValidations.tenant,
    ...commonValidations.roleId,
    body("permissions")
      .exists()
      .withMessage("permissions are missing in request body")
      .bail()
      .isArray()
      .withMessage("permissions must be an array")
      .bail()
      .notEmpty()
      .withMessage("permissions cannot be empty"),
    body("permissions.*")
      .isMongoId()
      .withMessage("each permission must be a valid ObjectId"),
  ],
};

module.exports = {
  ...roleValidations,
  ...commonValidations,
};
