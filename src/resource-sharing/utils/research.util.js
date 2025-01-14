const ResearchPublicationModel = require("@models/ResearchPublication");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const { isEmpty } = require("lodash");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- research-util`);

const research = {
  listPublications: async (request, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        research_area,
        status,
        tenant,
      } = {
        ...request.query,
      };

      const query = {};
      if (research_area) query.research_area = research_area;
      if (status) query.status = status;

      // Handle access level restrictions
      if (request.user.role !== "admin") {
        query.$or = [
          { access_level: "public" },
          { author_id: request.user._id },
          {
            access_level: "institutional",
            institution: request.user.institution,
          },
        ];
      }

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      };

      const publications = await ResearchPublicationModel(tenant).paginate(
        query,
        options
      );

      return {
        success: true,
        message: "Publications retrieved successfully",
        data: publications.docs,
        pagination: {
          total: publications.totalDocs,
          page: publications.page,
          pages: publications.totalPages,
          limit: publications.limit,
        },
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

  createPublication: async (request, next) => {
    try {
      const { tenant } = request.query;
      const publicationData = {
        ...request.body,
        author_id: request.user._id,
        author_info: {
          name: request.user.name,
          institution: request.user.institution,
          email: request.user.email,
          last_updated: new Date(),
        },
      };

      const newPublication = await ResearchPublicationModel(tenant).create(
        publicationData
      );

      return {
        success: true,
        message: "Research publication created successfully",
        data: newPublication,
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

  updatePublication: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { tenant } = request.query;
      const updateData = {
        ...request.body,
        "author_info.last_updated": new Date(),
      };

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );
      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      if (
        publication.author_id !== request.user._id &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedPublication = await ResearchPublicationModel(
        tenant
      ).findByIdAndUpdate(publication_id, updateData, { new: true });

      return {
        success: true,
        message: "Publication updated successfully",
        data: updatedPublication,
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

  getPublication: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { tenant } = request.query;

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );

      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      // Check access permissions
      if (
        publication.access_level === "private" &&
        publication.author_id !== request.user._id &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      if (
        publication.access_level === "institutional" &&
        publication.institution !== request.user.institution &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      return {
        success: true,
        message: "Publication retrieved successfully",
        data: publication,
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

  deletePublication: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { tenant } = request.query;

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );
      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      if (
        publication.author_id !== request.user._id &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      await ResearchPublicationModel(tenant).findByIdAndDelete(publication_id);

      return {
        success: true,
        message: "Publication deleted successfully",
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

  updatePublicationStatus: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { status } = request.body;
      const { tenant } = request.query;

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );
      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      if (
        publication.author_id !== request.user._id &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedPublication = await ResearchPublicationModel(
        tenant
      ).findByIdAndUpdate(
        publication_id,
        {
          status,
          "author_info.last_updated": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Publication status updated successfully",
        data: updatedPublication,
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

  addPublicationCitation: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { cited_by } = request.body;
      const { tenant } = request.query;

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );
      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      const newCitation = {
        cited_by,
        citation_date: new Date(),
      };

      const updatedPublication = await ResearchPublicationModel(
        tenant
      ).findByIdAndUpdate(
        publication_id,
        {
          $push: { citations: newCitation },
          "author_info.last_updated": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Citation added successfully",
        data: updatedPublication,
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

  updatePublicationAccessLevel: async (request, next) => {
    try {
      const { publication_id } = request.params;
      const { access_level } = request.body;
      const { tenant } = request.query;

      const publication = await ResearchPublicationModel(tenant).findById(
        publication_id
      );
      if (!publication) {
        throw new HttpError("Publication not found", httpStatus.NOT_FOUND);
      }

      if (
        publication.author_id !== request.user._id &&
        request.user.role !== "admin"
      ) {
        throw new HttpError("Unauthorized access", httpStatus.FORBIDDEN);
      }

      const updatedPublication = await ResearchPublicationModel(
        tenant
      ).findByIdAndUpdate(
        publication_id,
        {
          access_level,
          "author_info.last_updated": new Date(),
        },
        { new: true }
      );

      return {
        success: true,
        message: "Publication access level updated successfully",
        data: updatedPublication,
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

module.exports = research;
