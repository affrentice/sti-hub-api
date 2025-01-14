const mongoose = require("mongoose").set("debug", true);
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- research publication model`
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

// Research Publication Schema
const ResearchPublicationSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Research title is required!"],
      trim: true,
    },
    author_id: {
      type: String,
      required: [true, "Author ID is required!"],
    },
    // Cache frequently needed author data
    author_info: {
      name: String,
      institution: String,
      email: String,
      last_updated: Date,
    },
    institution: {
      type: String,
      required: [true, "Institution name is required!"],
    },
    abstract: {
      type: String,
      required: [true, "Research abstract is required!"],
    },
    keywords: [
      {
        type: String,
        required: [true, "At least one keyword is required!"],
      },
    ],
    publication_date: {
      type: Date,
      default: Date.now,
    },
    research_area: {
      type: String,
      required: [true, "Research area is required!"],
    },
    document_url: {
      type: String,
      required: [true, "Document URL is required!"],
    },
    status: {
      type: String,
      enum: ["published", "under_review", "draft"],
      default: "draft",
    },
    citations: [
      {
        cited_by: String,
        citation_date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    innovation_tags: [
      {
        type: String,
      },
    ],
    access_level: {
      type: String,
      enum: ["public", "private", "institutional"],
      default: "public",
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
ResearchPublicationSchema.index({ keywords: 1 });
ResearchPublicationSchema.index({ research_area: 1 });
ResearchPublicationSchema.index({
  title: "text",
  abstract: "text",
  keywords: "text",
});

// Add methods for Research Publication Schema
ResearchPublicationSchema.statics = {
  async searchByInnovation(
    innovationTags,
    { skip = 0, limit = 100 } = {},
    next
  ) {
    try {
      const response = await this.aggregate()
        .match({
          innovation_tags: { $in: innovationTags },
          status: "published",
          access_level: "public",
        })
        .lookup({
          from: "users",
          localField: "author_id",
          foreignField: "_id",
          as: "author",
        })
        .sort({ publication_date: -1 })
        .skip(skip)
        .limit(limit)
        .allowDiskUse(true);

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
};

const ResearchPublicationModel = (tenant) => {
  const defaultTenant = constants.DEFAULT_TENANT || "sti";
  const dbTenant = isEmpty(tenant) ? defaultTenant : tenant;
  try {
    let clients = mongoose.model("research_publications");
    return clients;
  } catch (error) {
    let clients = getModelByTenant(
      dbTenant,
      "research_publication",
      GrantApplicationSchema
    );
    return clients;
  }
};

module.exports = ResearchPublicationModel;
