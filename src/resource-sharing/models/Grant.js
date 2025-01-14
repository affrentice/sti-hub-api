const mongoose = require("mongoose").set("debug", true);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- grants-model`);
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

// Grant Schema
const GrantSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Grant title is required!"],
      trim: true,
    },
    donor_id: {
      type: String,
      required: [true, "donor_id is required!"],
    },
    // Cache frequently needed user data
    donor_info: {
      name: String,
      email: String,
      organization: String,
      last_updated: Date,
    },
    description: {
      type: String,
      required: [true, "Grant description is required!"],
    },
    amount: {
      type: Number,
      required: [true, "Grant amount is required!"],
    },
    application_deadline: {
      type: Date,
      required: [true, "Application deadline is required!"],
    },
    eligibility_criteria: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["active", "closed", "draft"],
      default: "draft",
    },
    sector: {
      type: String,
      required: [true, "Sector is required!"],
    },
    application_process: {
      type: String,
      required: [true, "Application process details are required!"],
    },
    documents_required: [
      {
        type: String,
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
GrantSchema.index({ sector: 1, status: 1 });
GrantSchema.index({ application_deadline: 1 });

// Add methods for Grant Schema
GrantSchema.statics = {
  async list({ skip = 0, limit = 100, filter = {} } = {}, next) {
    try {
      const response = await this.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      return {
        success: true,
        data: response,
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

  // Method to update cached user info
  async updateUserInfo(userId, userInfo) {
    const updateData = {
      donor_info: {
        ...userInfo,
        last_updated: new Date(),
      },
    };

    await this.updateMany({ donor_id: userId }, { $set: updateData });
  },
};

const GrantModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let clients = mongoose.model("grants");
    return clients;
  } catch (error) {
    let clients = getModelByTenant(dbTenant, "grant", GrantSchema);
    return clients;
  }
};

module.exports = GrantModel;
