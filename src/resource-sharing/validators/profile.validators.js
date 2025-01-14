const { query, body, param, oneOf } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

const commonValidations = {
  userId: [
    param("userId")
      .exists()
      .withMessage("User ID is required")
      .isMongoId()
      .withMessage("Invalid User ID format")
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

const profileValidations = {
  createProfile: [
    body("headline").optional().isString().trim().isLength({ max: 200 }),
    body("bio").optional().isString().trim().isLength({ max: 1000 }),
    body("skills").optional().isArray(),
    body("skills.*").isString().trim(),
    body("visibility").optional().isIn(["public", "private", "connections"]),
  ],

  viewProfile: [...commonValidations.userId],

  updateVisibility: [
    body("visibility")
      .exists()
      .withMessage("Visibility setting is required")
      .isIn(["public", "private", "connections"]),
  ],

  achievement: [
    body("title").exists().isString().trim().isLength({ max: 200 }),
    body("description").optional().isString().trim().isLength({ max: 1000 }),
    body("date").optional().isISO8601().withMessage("Invalid date format"),
  ],

  achievementId: [
    param("achievementId")
      .exists()
      .withMessage("Achievement ID is required")
      .isMongoId()
      .withMessage("Invalid Achievement ID format"),
  ],

  skills: [
    body("skills").isArray().withMessage("Skills must be an array"),
    body("skills.*").isString().trim(),
  ],

  socialLinks: [
    body("linkedin").optional().isURL().withMessage("Invalid LinkedIn URL"),
    body("twitter").optional().isURL().withMessage("Invalid Twitter URL"),
    body("website").optional().isURL().withMessage("Invalid Website URL"),
  ],

  content: [
    body("content").exists().isString().trim(),
    body("contentType").exists().isIn(["text", "link", "image"]),
    body("visibility").optional().isIn(["public", "private", "connections"]),
  ],

  getUserContent: [
    ...commonValidations.userId,
    query("contentType").optional().isIn(["text", "link", "image"]),
  ],

  searchProfiles: [
    query("keyword").optional().isString().trim(),
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
    query("skills").optional().isString(),
  ],

  profileStats: [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],

  engagement: [
    query("metric").optional().isIn(["views", "connections", "shares"]),
    query("period").optional().isIn(["day", "week", "month", "year"]),
  ],

  theme: [
    body("theme").exists().isObject(),
    body("theme.color").optional().isString(),
    body("theme.layout").optional().isString(),
  ],

  recommendations: [
    query("type").optional().isIn(["connections", "content", "opportunities"]),
    query("limit").optional().isInt({ min: 1, max: 50 }),
  ],

  exportProfile: [
    query("format").optional().isIn(["json", "pdf", "csv"]),
    query("includeStats").optional().isBoolean(),
  ],

  privacy: [
    body("settings").isObject(),
    body("settings.profileVisibility")
      .optional()
      .isIn(["public", "private", "connections"]),
    body("settings.contentVisibility")
      .optional()
      .isIn(["public", "private", "connections"]),
    body("settings.searchable").optional().isBoolean(),
  ],
};

module.exports = {
  ...profileValidations,
  pagination: commonValidations.pagination,
};
