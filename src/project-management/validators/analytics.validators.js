const { body, query } = require("express-validator");

// Define middleware utilities
const middlewareUtils = {
  // Common headers middleware
  headers: (req, res, next) => {
    // Add your headers validation logic here
    // For example:
    if (!req.headers["content-type"]) {
      return res.status(400).json({ error: "Content-Type header is required" });
    }
    next();
  },

  // Pagination middleware
  pagination: (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
    };

    next();
  },
};

const analyticsValidations = {
  dateRange: [
    query("start_date")
      .exists()
      .withMessage("Start date is required")
      .isISO8601()
      .withMessage("Invalid start date format"),
    query("end_date")
      .exists()
      .withMessage("End date is required")
      .isISO8601()
      .withMessage("Invalid end date format")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.query.start_date)) {
          throw new Error("End date must be after start date");
        }
        return true;
      }),
  ],

  trackEvent: [
    body("user_id")
      .exists()
      .withMessage("User ID is required")
      .trim()
      .notEmpty()
      .withMessage("User ID cannot be empty"),
    body("event_type")
      .exists()
      .withMessage("Event type is required")
      .isIn([
        "login",
        "connection_made",
        "resource_access",
        "project_update",
        "message_sent",
      ])
      .withMessage("Invalid event type"),
    body("platform")
      .exists()
      .withMessage("Platform is required")
      .isIn(["web", "mobile", "api"])
      .withMessage("Invalid platform"),
    body("session_id")
      .exists()
      .withMessage("Session ID is required")
      .trim()
      .notEmpty()
      .withMessage("Session ID cannot be empty"),
    body("metadata")
      .optional()
      .isObject()
      .withMessage("Metadata must be an object"),
  ],

  userFilter: [
    query("user_id")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("User ID cannot be empty if provided"),
  ],
};

module.exports = {
  middlewareUtils,
  analyticsValidations,
};
