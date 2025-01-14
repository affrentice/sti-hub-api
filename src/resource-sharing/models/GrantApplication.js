const mongoose = require("mongoose").set("debug", true);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- grant application model`
);
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

// Application Schema (for tracking grant applications)
const GrantApplicationSchema = new Schema(
  {
    grant_id: {
      type: ObjectId,
      ref: "grants",
      required: [true, "Grant ID is required!"],
    },
    applicant_id: {
      type: String,
      required: [true, "Applicant ID is required!"],
    },
    applicant_info: {
      name: String,
      email: String,
      organization: String,
      last_updated: Date,
    },
    status: {
      type: String,
      enum: ["submitted", "under_review", "approved", "rejected"],
      default: "submitted",
    },
    submission_date: {
      type: Date,
      default: Date.now,
    },
    documents: [
      {
        title: String,
        url: String,
        uploaded_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    review_notes: [
      {
        note: String,
        reviewer_id: String,
        reviewer_info: {
          name: String,
          role: String,
          last_updated: Date,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

const GrantApplicationModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let clients = mongoose.model("grant_applications");
    return clients;
  } catch (error) {
    let clients = getModelByTenant(
      dbTenant,
      "grant_application",
      GrantApplicationSchema
    );
    return clients;
  }
};

module.exports = GrantApplicationModel;
