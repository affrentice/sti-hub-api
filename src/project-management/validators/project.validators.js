const { body, param, query } = require("express-validator");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

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
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
    next();
  },
};

const commonValidations = {
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
};

const projectValidations = {
  projectId: commonValidations.mongoId("project_id"),

  create: [
    body("entrepreneur_id")
      .exists()
      .withMessage("Entrepreneur ID is required")
      .trim()
      .notEmpty()
      .withMessage("Entrepreneur ID cannot be empty"),
  ],

  update: [
    body().custom((value, { req }) => {
      if (Object.keys(req.body).length === 0) {
        throw new Error("Update body cannot be empty");
      }
      return true;
    }),
  ],

  title: [
    body("title")
      .exists()
      .withMessage("Project title is required")
      .trim()
      .notEmpty()
      .withMessage("Project title cannot be empty")
      .isLength({ min: 5, max: 200 })
      .withMessage("Project title must be between 5 and 200 characters"),
  ],

  description: [
    body("description")
      .exists()
      .withMessage("Project description is required")
      .trim()
      .notEmpty()
      .withMessage("Project description cannot be empty")
      .isLength({ min: 20 })
      .withMessage("Description must be at least 20 characters long"),
  ],

  budget: [
    body("budget.amount")
      .exists()
      .withMessage("Budget amount is required")
      .isNumeric()
      .withMessage("Budget amount must be a number")
      .isFloat({ min: 0 })
      .withMessage("Budget amount must be greater than 0"),
    body("budget.currency")
      .optional()
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage("Currency must be a 3-letter code"),
  ],

  timeline: [
    body("timeline.start_date")
      .exists()
      .withMessage("Start date is required")
      .isISO8601()
      .withMessage("Invalid start date format"),
    body("timeline.end_date")
      .exists()
      .withMessage("End date is required")
      .isISO8601()
      .withMessage("Invalid end date format")
      .custom((value, { req }) => {
        if (new Date(value) <= new Date(req.body.timeline.start_date)) {
          throw new Error("End date must be after start date");
        }
        return true;
      }),
  ],

  stakeholders: [
    body("stakeholders").isArray().withMessage("Stakeholders must be an array"),
    body("stakeholders.*.user_id")
      .exists()
      .withMessage("Stakeholder user ID is required")
      .trim()
      .notEmpty()
      .withMessage("Stakeholder user ID cannot be empty"),
    body("stakeholders.*.role")
      .exists()
      .withMessage("Stakeholder role is required")
      .isIn(["owner", "manager", "contributor", "observer"])
      .withMessage("Invalid stakeholder role"),
  ],

  status: [
    body("status")
      .exists()
      .withMessage("Project status is required")
      .trim()
      .isIn(["planning", "active", "on_hold", "completed", "cancelled"])
      .withMessage("Invalid project status"),
  ],

  metrics: [
    body("metrics.kpis")
      .optional()
      .isArray()
      .withMessage("KPIs must be an array"),
    body("metrics.kpis.*.name")
      .exists()
      .withMessage("KPI name is required")
      .trim()
      .notEmpty()
      .withMessage("KPI name cannot be empty"),
    body("metrics.kpis.*.target")
      .exists()
      .withMessage("KPI target is required")
      .isNumeric()
      .withMessage("KPI target must be a number"),
  ],

  milestone: [
    body("title")
      .exists()
      .withMessage("Milestone title is required")
      .trim()
      .notEmpty()
      .withMessage("Milestone title cannot be empty"),
    body("due_date")
      .exists()
      .withMessage("Milestone due date is required")
      .isISO8601()
      .withMessage("Invalid due date format"),
    body("description")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Milestone description cannot be empty if provided"),
  ],

  milestoneId: commonValidations.mongoId("milestone_id"),

  milestoneStatus: [
    body("status")
      .exists()
      .withMessage("Milestone status is required")
      .isIn(["pending", "in_progress", "completed", "delayed"])
      .withMessage("Invalid milestone status"),
  ],

  list: [
    query("status")
      .optional()
      .trim()
      .isIn(["planning", "active", "on_hold", "completed", "cancelled"])
      .withMessage("Invalid status filter"),
    query("entrepreneur_id")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Entrepreneur ID cannot be empty if provided"),
  ],
};

module.exports = {
  projectValidations,
  middlewareUtils,
  commonValidations,
};
