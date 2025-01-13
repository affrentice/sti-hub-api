const { query, body, param, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const commonValidations = {
  tenant: [
    query("tenant")
      .optional()
      .notEmpty()
      .withMessage("tenant cannot be empty if provided")
      .bail()
      .trim()
      .toLowerCase()
      .isIn(["sti"])
      .withMessage("the tenant value is not among the expected ones"),
  ],
  groupId: [
    param("grp_id")
      .exists()
      .withMessage("the group ID parameter is required")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the group ID parameter must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  userId: [
    param("user_id")
      .exists()
      .withMessage("the user ID parameter is required")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the user ID parameter must be an object ID")
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
};

const groupValidations = {
  createGroup: [
    ...commonValidations.tenant,
    body("grp_title")
      .exists()
      .withMessage("the grp_title is required")
      .bail()
      .notEmpty()
      .withMessage("the grp_title should not be empty")
      .trim(),
    body("grp_description")
      .exists()
      .withMessage("the grp_description is required")
      .bail()
      .notEmpty()
      .withMessage("the grp_description should not be empty")
      .trim(),
    body("user_id")
      .optional()
      .notEmpty()
      .withMessage("the user_id should not be empty IF provided")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("the user_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("grp_country")
      .optional()
      .notEmpty()
      .withMessage("the grp_country should not be empty if provided")
      .bail()
      .trim(),
    body("grp_image")
      .optional()
      .notEmpty()
      .withMessage("the grp_image should not be empty if provided")
      .bail()
      .trim(),
    body("grp_timezone")
      .optional()
      .notEmpty()
      .withMessage("the grp_timezone should not be empty if provided")
      .bail()
      .trim(),
    body("grp_industry")
      .optional()
      .notEmpty()
      .withMessage("the grp_industry should not be empty if provided")
      .bail()
      .trim(),
    body("grp_website")
      .optional()
      .notEmpty()
      .withMessage("the grp_website should not be empty if provided")
      .bail()
      .isURL()
      .withMessage("the grp_website must be a valid URL"),
  ],

  updateGroup: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    body("grp_description")
      .optional()
      .notEmpty()
      .withMessage("the grp_description should not be empty if provided")
      .trim(),
    body("grp_country")
      .optional()
      .notEmpty()
      .withMessage("the grp_country should not be empty if provided")
      .bail()
      .trim(),
    body("grp_timezone")
      .optional()
      .notEmpty()
      .withMessage("the grp_timezone should not be empty if provided")
      .bail()
      .trim(),
    body("grp_industry")
      .optional()
      .notEmpty()
      .withMessage("the grp_industry should not be empty if provided")
      .bail()
      .trim(),
    body("grp_image")
      .optional()
      .notEmpty()
      .withMessage("the grp_image should not be empty if provided")
      .bail()
      .trim(),
    body("grp_website")
      .optional()
      .notEmpty()
      .withMessage("the grp_website should not be empty if provided")
      .bail()
      .isURL()
      .withMessage("the grp_website must be a valid URL")
      .trim(),
    body("grp_status")
      .optional()
      .notEmpty()
      .withMessage("the grp_status should not be empty if provided")
      .bail()
      .trim()
      .toUpperCase()
      .isIn(["INACTIVE", "ACTIVE"])
      .withMessage(
        "the grp_status value is not among the expected ones, use ACTIVE or INACTIVE"
      ),
  ],

  deleteGroup: [...commonValidations.tenant, ...commonValidations.groupId],

  listGroups: [
    ...commonValidations.tenant,
    query("grp_id")
      .optional()
      .isMongoId()
      .withMessage("grp_id must be an object ID IF provided")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    query("grp_title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("grp_title should not be empty IF provided")
      .bail(),
    query("grp_status")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("grp_status should not be empty IF provided")
      .bail()
      .trim()
      .toUpperCase()
      .isIn(["INACTIVE", "ACTIVE"])
      .withMessage(
        "the grp_status value is not among the expected ones, use ACTIVE or INACTIVE"
      ),
  ],

  getGroup: [...commonValidations.tenant, ...commonValidations.groupId],

  listSummary: [...commonValidations.tenant],

  getGroupUsers: [...commonValidations.tenant, ...commonValidations.groupId],

  assignUsers: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    body("user_ids")
      .exists()
      .withMessage("the user_ids should be provided")
      .bail()
      .custom((value) => Array.isArray(value))
      .withMessage("the user_ids should be an array")
      .bail()
      .notEmpty()
      .withMessage("the user_ids should not be empty"),
    body("user_ids.*")
      .isMongoId()
      .withMessage("user_id provided must be an object ID"),
  ],

  assignOneUser: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    ...commonValidations.userId,
  ],

  unassignUser: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    ...commonValidations.userId,
  ],

  unassignManyUsers: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    body("user_ids")
      .exists()
      .withMessage("the user_ids should be provided")
      .bail()
      .custom((value) => Array.isArray(value))
      .withMessage("the user_ids should be an array")
      .bail()
      .notEmpty()
      .withMessage("the user_ids should not be empty"),
    body("user_ids.*")
      .isMongoId()
      .withMessage("user_id provided must be an object ID"),
  ],

  setManager: [
    ...commonValidations.tenant,
    ...commonValidations.groupId,
    ...commonValidations.userId,
  ],

  listRoles: [...commonValidations.tenant, ...commonValidations.groupId],

  removeConstraints: [...commonValidations.tenant],
};

module.exports = {
  ...groupValidations,
  pagination: commonValidations.pagination,
};
