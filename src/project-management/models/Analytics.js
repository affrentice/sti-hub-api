const mongoose = require("mongoose").set("debug", true);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- analytics-model`);
const { getModelByTenant } = require("@config/database");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");
const {
  mailer,
  stringify,
  date,
  msgs,
  emailTemplates,
  generateFilter,
  winstonLogger,
  responseHandler,
} = require("@utils/common");

// Analytics Event Schema
const AnalyticsEventSchema = new Schema(
  {
    user_id: {
      type: String,
      required: [true, "User ID is required!"],
      index: true,
    },
    event_type: {
      type: String,
      required: [true, "Event type is required!"],
      enum: [
        "login",
        "connection_made",
        "resource_access",
        "project_update",
        "message_sent",
      ],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
    },
    platform: {
      type: String,
      enum: ["web", "mobile", "api"],
      required: true,
    },
    session_id: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Project Schema
const ProjectSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Project title is required!"],
      trim: true,
    },
    entrepreneur_id: {
      type: String,
      required: [true, "Entrepreneur ID is required!"],
      index: true,
    },
    description: {
      type: String,
      required: [true, "Project description is required!"],
    },
    status: {
      type: String,
      enum: ["planning", "active", "on_hold", "completed", "cancelled"],
      default: "planning",
      index: true,
    },
    budget: {
      amount: Number,
      currency: {
        type: String,
        default: "UGX",
      },
    },
    timeline: {
      start_date: Date,
      end_date: Date,
      milestones: [
        {
          title: String,
          due_date: Date,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "delayed"],
            default: "pending",
          },
          description: String,
        },
      ],
    },
    metrics: {
      kpis: [
        {
          name: String,
          target: Number,
          current: Number,
          unit: String,
          last_updated: Date,
        },
      ],
      performance_indicators: [
        {
          category: String,
          value: Number,
          timestamp: Date,
        },
      ],
    },
    stakeholders: [
      {
        user_id: String,
        role: {
          type: String,
          enum: ["owner", "manager", "contributor", "observer"],
        },
        permissions: [String],
      },
    ],
    attachments: [
      {
        file_name: String,
        file_url: String,
        upload_date: Date,
        file_type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
ProjectSchema.index({ "timeline.start_date": 1, "timeline.end_date": 1 });
ProjectSchema.index({ "metrics.performance_indicators.timestamp": 1 });

// Analytics Methods
AnalyticsEventSchema.statics = {
  async getEngagementMetrics({ startDate, endDate, eventType } = {}, next) {
    try {
      const filter = {
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      };

      if (eventType) {
        filter.event_type = eventType;
      }

      const metrics = await this.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              eventType: "$event_type",
              day: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.day": 1 } },
      ]);

      return {
        success: true,
        data: metrics,
        status: httpStatus.OK,
      };
    } catch (error) {
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
};

// Project Methods
ProjectSchema.statics = {
  async list({ skip = 0, limit = 50, filter = {} } = {}, next) {
    try {
      const projects = await this.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        data: projects,
        status: httpStatus.OK,
      };
    } catch (error) {
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },

  async updateProjectMetrics(projectId, metrics, next) {
    try {
      const update = {
        $push: {
          "metrics.performance_indicators": {
            $each: metrics,
            $sort: { timestamp: -1 },
          },
        },
      };

      const updated = await this.findByIdAndUpdate(projectId, update, {
        new: true,
      });
      return {
        success: true,
        data: updated,
        status: httpStatus.OK,
      };
    } catch (error) {
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
};

// Model creation with tenant support
const AnalyticsModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let analytics = mongoose.model("analytics_events");
    return analytics;
  } catch (error) {
    let analytics = getModelByTenant(
      dbTenant,
      "analytics_event",
      AnalyticsEventSchema
    );
    return analytics;
  }
};

const ProjectModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let projects = mongoose.model("projects");
    return projects;
  } catch (error) {
    let projects = getModelByTenant(dbTenant, "project", ProjectSchema);
    return projects;
  }
};

module.exports = {
  AnalyticsModel,
  ProjectModel,
};
