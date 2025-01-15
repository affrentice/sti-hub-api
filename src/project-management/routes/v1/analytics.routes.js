const express = require("express");
const router = express.Router();
const analyticsController = require("@controllers/analytics.controller");
const {
  middlewareUtils,
  analyticsValidations,
} = require("@validators/analytics.validators");

// Get engagement metrics
router.get(
  "/engagement",
  analyticsValidations.dateRange,
  analyticsController.getEngagementMetrics
);

// Get project performance metrics
router.get(
  "/projects/performance",
  analyticsValidations.dateRange,
  analyticsController.getProjectPerformance
);

// Track analytics event
router.post(
  "/events",
  analyticsValidations.trackEvent,
  analyticsController.trackEvent
);

// Get user activity analytics
router.get(
  "/users/activity",
  [...analyticsValidations.dateRange, ...analyticsValidations.userFilter],
  analyticsController.getUserActivity
);

// Get platform usage statistics
router.get(
  "/platform/usage",
  analyticsValidations.dateRange,
  analyticsController.getPlatformUsage
);

module.exports = router;
