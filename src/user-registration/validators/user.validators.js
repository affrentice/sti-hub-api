const { query, body, param, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const commonValidations = {
  userId: [
    param("userId")
      .exists()
      .withMessage("User ID is missing in request")
      .trim()
      .notEmpty()
      .withMessage("User ID cannot be empty")
      .isMongoId()
      .withMessage("User ID must be a valid ObjectId")
      .customSanitizer((value) => ObjectId(value)),
  ],
  pagination: (defaultLimit = 50, maxLimit = 500) => {
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

const userValidations = {
  ...commonValidations,
  registration: [
    body("email")
      .exists()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
    body("firstName")
      .exists()
      .withMessage("First name is required")
      .trim()
      .notEmpty(),
    body("lastName")
      .exists()
      .withMessage("Last name is required")
      .trim()
      .notEmpty(),
    body("userType")
      .exists()
      .withMessage("User type is required")
      .isIn([
        "entrepreneur",
        "investor",
        "bdsProvider",
        "academia",
        "generalPartner",
        "stiStaff",
      ])
      .withMessage("Invalid user type"),
  ],

  profileCompletion: [
    body()
      .custom((value, { req }) => {
        switch (req.user.userType) {
          case "entrepreneur":
            return !!value.business?.name;
          case "investor":
            return !!value.organization?.name;
          case "bdsProvider":
            return !!value.organization?.name;
          case "academia":
            return !!value.institution?.name;
          case "generalPartner":
            return !!value.organization?.name;
          case "stiStaff":
            return !!value.position;
          default:
            return false;
        }
      })
      .withMessage("Required profile fields are missing"),
  ],

  login: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
    body("password")
      .exists()
      .withMessage("Password is required")
      .notEmpty()
      .withMessage("Password cannot be empty"),
  ],

  googleAuth: [
    body("token")
      .exists()
      .withMessage("Google token is required")
      .notEmpty()
      .withMessage("Google token cannot be empty"),
  ],

  profileUpdate: [
    body("phone")
      .optional()
      .matches(/^\+?[\d\s-()]+$/)
      .withMessage("Invalid phone number format"),
    body("profilePicture")
      .optional()
      .isURL()
      .withMessage("Profile picture must be a valid URL")
      .isLength({ max: 200 }),
    body("website").optional().isURL().withMessage("Invalid website URL"),
  ],

  passwordChange: [
    body("currentPassword")
      .exists()
      .withMessage("Current password is required")
      .notEmpty(),
    body("newPassword")
      .exists()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("New password must be at least 8 characters long"),
  ],

  resetPasswordRequest: [
    body("email")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail(),
  ],

  resetPassword: [
    param("token")
      .exists()
      .withMessage("Reset token is required")
      .notEmpty()
      .withMessage("Reset token cannot be empty"),
    body("password")
      .exists()
      .withMessage("New password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],

  publicProfile: [
    body("headline").optional().trim().notEmpty(),
    body("bio").optional().trim().notEmpty(),
    body("visibility")
      .optional()
      .isIn(["public", "private", "connections"])
      .withMessage("Invalid visibility option"),
  ],

  accountStatus: [
    body("status")
      .exists()
      .withMessage("Status is required")
      .isIn(["active", "inactive", "pending"])
      .withMessage("Invalid status value"),
  ],

  accountDeletion: [
    body("confirmation")
      .exists()
      .withMessage("Deletion confirmation is required")
      .isBoolean()
      .withMessage("Confirmation must be a boolean value")
      .equals("true")
      .withMessage("Must confirm account deletion"),
  ],

  profileDraft: [
    body()
      .exists()
      .withMessage("Draft data is required")
      .notEmpty()
      .withMessage("Draft cannot be empty"),
  ],

  adminOperation: [
    query("userType")
      .optional()
      .isIn([
        "entrepreneur",
        "investor",
        "bdsProvider",
        "academia",
        "generalPartner",
        "stiStaff",
      ]),
    query("status").optional().isIn(["active", "inactive", "pending"]),
  ],

  adminUserUpdate: [
    ...commonValidations.userId,
    body("status")
      .optional()
      .isIn(["active", "inactive", "pending"])
      .withMessage("Invalid status value"),
    body("verified")
      .optional()
      .isBoolean()
      .withMessage("Verified must be a boolean value"),
  ],

  verificationToken: [
    param("token")
      .exists()
      .withMessage("Verification token is required")
      .notEmpty()
      .withMessage("Verification token cannot be empty"),
  ],

  bulkUsers: [
    body("userIds")
      .exists()
      .withMessage("User IDs array is required")
      .isArray()
      .withMessage("User IDs must be an array")
      .custom((value) => {
        return value.every((id) => mongoose.Types.ObjectId.isValid(id));
      })
      .withMessage("All user IDs must be valid ObjectIds"),
  ],
};

module.exports = {
  ...userValidations,
  pagination: commonValidations.pagination,
};
