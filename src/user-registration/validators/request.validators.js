const { query, body, param } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const constants = require("@config/constants");
const commonValidations = {
  tenant: [
    query("tenant")
      .optional()
      .notEmpty()
      .withMessage("tenant should not be empty if provided")
      .trim()
      .toLowerCase()
      .bail()
      .isIn(constants.NETWORKS)
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
  requestId: [
    param("request_id")
      .exists()
      .withMessage(
        "the request identifier is missing in request, consider using the request_id"
      )
      .bail()
      .trim()
      .isMongoId()
      .withMessage("request_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  status: [
    body("status")
      .if(body("status").exists())
      .notEmpty()
      .trim()
      .toLowerCase()
      .isIn(["pending", "rejected", "approved"])
      .withMessage(
        "the status value is not among the expected ones which include: rejected, approved and pending"
      ),
  ],
};
const requestValidations = {
  requestGroupAccess: [
    ...commonValidations.tenant,
    param("grp_id")
      .exists()
      .withMessage("the grp_ids should be provided")
      .bail()
      .notEmpty()
      .withMessage("the grp_id cannot be empty")
      .bail()
      .isMongoId()
      .withMessage("the grp_id is not a valid Object")
      .trim(),
  ],
  requestGroupAccessByEmail: [
    ...commonValidations.tenant,
    param("grp_id")
      .exists()
      .withMessage("the grp_ids should be provided")
      .bail()
      .notEmpty()
      .withMessage("the grp_id cannot be empty")
      .bail()
      .isMongoId()
      .withMessage("the grp_id is not a valid Object")
      .trim(),
    body("emails")
      .exists()
      .withMessage("the emails should be provided")
      .bail()
      .custom((value) => Array.isArray(value))
      .withMessage("the emails should be an array")
      .bail()
      .notEmpty()
      .withMessage("the emails should not be empty"),
    body("emails.*")
      .notEmpty()
      .withMessage("the email cannot be empty")
      .bail()
      .isEmail()
      .withMessage("the email is not valid"),
  ],
  acceptInvitation: [
    ...commonValidations.tenant,
    body("email")
      .exists()
      .withMessage("the email should be provided")
      .bail()
      .notEmpty()
      .withMessage("the emails should not be empty")
      .bail()
      .isEmail()
      .withMessage("the email is not valid"),
    body("target_id")
      .exists()
      .withMessage("the target_id is missing in request")
      .bail()
      .trim()
      .isMongoId()
      .withMessage("target_id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  requestNetworkAccess: [
    ...commonValidations.tenant,
    param("net_id")
      .exists()
      .withMessage("the net_id should be provided")
      .bail()
      .notEmpty()
      .withMessage("the net_id cannot be empty")
      .bail()
      .isMongoId()
      .withMessage("the net_id is not a valid Object")
      .trim(),
  ],
  list: [...commonValidations.tenant],

  approveReject: [
    ...commonValidations.tenant,
    ...commonValidations.requestId,
    ...commonValidations.status,
  ],
  delete: [...commonValidations.tenant, ...commonValidations.requestId],
  update: [
    ...commonValidations.tenant,
    ...commonValidations.requestId,
    ...commonValidations.status,
  ],
  listByGroup: [
    ...commonValidations.tenant,
    param("grp_id")
      .exists()
      .withMessage("the grp_id should be provided")
      .bail()
      .notEmpty()
      .withMessage("grp_id should not be empty")
      .bail()
      .isMongoId()
      .withMessage("the grp_id should be an object ID")
      .trim(),
  ],
  listByNetwork: [
    ...commonValidations.tenant,
    param("net_id")
      .exists()
      .withMessage("the net_id should be provided")
      .bail()
      .notEmpty()
      .withMessage("net_id should not be empty")
      .bail()
      .isMongoId()
      .withMessage("the net_id should be an object ID")
      .trim(),
  ],
};
module.exports = {
  ...requestValidations,
  pagination: commonValidations.pagination,
};
