const AnalyticsModel = require("@models/Analytics");
const ProjectModel = require("@models/Project");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- analytics-util`);

const analytics = {
  getEngagementMetrics: async (request, next) => {
    try {
      const { start_date, end_date, event_type, tenant } = request.query;

      const query = {
        timestamp: {
          $gte: new Date(start_date),
          $lte: new Date(end_date),
        },
      };

      if (event_type) {
        query.event_type = event_type;
      }

      const metrics = await AnalyticsModel(tenant).aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              eventType: "$event_type",
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            count: { $sum: 1 },
            uniqueUsers: { $addToSet: "$user_id" },
          },
        },
        {
          $project: {
            eventType: "$_id.eventType",
            date: "$_id.date",
            count: 1,
            uniqueUsers: { $size: "$uniqueUsers" },
            _id: 0,
          },
        },
        { $sort: { date: 1 } },
      ]);

      return {
        success: true,
        message: "Engagement metrics retrieved successfully",
        data: metrics,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  getProjectPerformance: async (request, next) => {
    try {
      const { start_date, end_date, tenant } = request.query;

      const projectMetrics = await ProjectModel(tenant).aggregate([
        {
          $match: {
            "metrics.performance_indicators.timestamp": {
              $gte: new Date(start_date),
              $lte: new Date(end_date),
            },
            isActive: true,
          },
        },
        {
          $unwind: "$metrics.performance_indicators",
        },
        {
          $group: {
            _id: {
              project: "$_id",
              category: "$metrics.performance_indicators.category",
            },
            avgValue: { $avg: "$metrics.performance_indicators.value" },
            minValue: { $min: "$metrics.performance_indicators.value" },
            maxValue: { $max: "$metrics.performance_indicators.value" },
            dataPoints: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.project",
            metrics: {
              $push: {
                category: "$_id.category",
                average: "$avgValue",
                minimum: "$minValue",
                maximum: "$maxValue",
                dataPoints: "$dataPoints",
              },
            },
          },
        },
      ]);

      return {
        success: true,
        message: "Project performance metrics retrieved successfully",
        data: projectMetrics,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  trackEvent: async (request, next) => {
    try {
      const { tenant } = request.query;
      const eventData = {
        ...request.body,
        timestamp: new Date(),
        session_id: request.sessionID || request.body.session_id,
      };

      const newEvent = await AnalyticsModel(tenant).create(eventData);

      return {
        success: true,
        message: "Event tracked successfully",
        data: newEvent,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  getUserActivity: async (request, next) => {
    try {
      const { start_date, end_date, user_id, tenant } = request.query;

      const query = {
        timestamp: {
          $gte: new Date(start_date),
          $lte: new Date(end_date),
        },
      };

      if (user_id) {
        query.user_id = user_id;
      }

      const userActivity = await AnalyticsModel(tenant).aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              userId: "$user_id",
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            activities: {
              $push: {
                event_type: "$event_type",
                timestamp: "$timestamp",
                metadata: "$metadata",
              },
            },
            totalEvents: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.userId",
            dailyActivity: {
              $push: {
                date: "$_id.date",
                activities: "$activities",
                totalEvents: "$totalEvents",
              },
            },
            totalEvents: { $sum: "$totalEvents" },
          },
        },
      ]);

      return {
        success: true,
        message: "User activity retrieved successfully",
        data: userActivity,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },

  getPlatformUsage: async (request, next) => {
    try {
      const { start_date, end_date, tenant } = request.query;

      const usageStats = await AnalyticsModel(tenant).aggregate([
        {
          $match: {
            timestamp: {
              $gte: new Date(start_date),
              $lte: new Date(end_date),
            },
          },
        },
        {
          $facet: {
            platformUsage: [
              {
                $group: {
                  _id: "$platform",
                  totalEvents: { $sum: 1 },
                  uniqueUsers: { $addToSet: "$user_id" },
                },
              },
              {
                $project: {
                  platform: "$_id",
                  totalEvents: 1,
                  uniqueUsers: { $size: "$uniqueUsers" },
                  _id: 0,
                },
              },
            ],
            eventTypeBreakdown: [
              {
                $group: {
                  _id: "$event_type",
                  count: { $sum: 1 },
                },
              },
            ],
            hourlyDistribution: [
              {
                $group: {
                  _id: { $hour: "$timestamp" },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
          },
        },
      ]);

      return {
        success: true,
        message: "Platform usage statistics retrieved successfully",
        data: usageStats[0],
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          {
            message: error.message,
          }
        )
      );
    }
  },
};

module.exports = analytics;
