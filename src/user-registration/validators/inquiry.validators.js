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
const inquiryValidations = {
  register: [
    ...commonValidations.tenant,
    body("email")
      .exists()
      .withMessage("the email should be provided")
      .bail()
      .trim()
      .isEmail()
      .withMessage("this is not a valid email address"),
    body("category")
      .exists()
      .withMessage("the category should be provided")
      .bail()
      .trim()
      .toLowerCase()
      .isIn([
        "general",
        "data",
        "feedback",
        "monitors",
        "partners",
        "researchers",
        "policy",
        "champions",
        "developers",
        "assistance",
      ])
      .withMessage(
        "the category value is not among the expected ones which are: general, data, feedback, monitors, partners,researchers,policy,champions,developers,assistance"
      ),
    body("message")
      .exists()
      .withMessage("the message should be provided")
      .bail()
      .trim(),
    body("fullName")
      .exists()
      .withMessage("the fullName should be provided")
      .bail()
      .trim(),
  ],
  list: [...commonValidations.tenant],
  delete: [
    ...commonValidations.tenant,
    query("id")
      .exists()
      .withMessage(
        "the candidate identifier is missing in request, consider using the id"
      )
      .bail()
      .trim()
      .isMongoId()
      .withMessage("id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
  ],
  update: [
    ...commonValidations.tenant,
    query("id")
      .exists()
      .withMessage(
        "the candidate identifier is missing in request, consider using the id"
      )
      .bail()
      .trim()
      .isMongoId()
      .withMessage("id must be an object ID")
      .bail()
      .customSanitizer((value) => ObjectId(value)),
    body("status")
      .if(body("status").exists())
      .notEmpty()
      .trim()
      .toLowerCase()
      .isIn(["pending", "rejected"])
      .withMessage(
        "the status value is not among the expected ones which include: rejected and pending"
      ),
  ],
};
module.exports = {
  ...inquiryValidations,
  pagination: commonValidations.pagination,
};
