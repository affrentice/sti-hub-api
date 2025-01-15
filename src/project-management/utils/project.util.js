const ProjectModel = require("@models/Project");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const { isEmpty } = require("lodash");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- project-util`);
const project = {
  list: async (request, next) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        tenant,
      } = {
        ...request.query,
      };
      const query = { isActive: true };
      if (status) query.status = status;
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { createdAt: -1 },
      };
      const projects = await ProjectModel(tenant).paginate(query, options);
      return {
        success: true,
        message: "Projects retrieved successfully",
        data: projects.docs,
        pagination: {
          total: projects.totalDocs,
          page: projects.page,
          pages: projects.totalPages,
          limit: projects.limit,
        },
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  create: async (request, next) => {
    try {
      const { tenant } = request.query;
      const projectData = {
        ...request.body,
        created_by: request.user._id,
        creator_info: {
          name: `${request.user.firstName} ${request.user.lastName}`,
          email: request.user.email,
          last_updated: new Date(),
        },
      };
      const newProject = await ProjectModel(tenant).create(projectData);
      return {
        success: true,
        message: "Project created successfully",
        data: newProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  update: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { tenant } = request.query;
      const updateData = request.body;
      const updatedProject = await ProjectModel(tenant).findByIdAndUpdate(
        project_id,
        {
          ...updateData,
          "creator_info.last_updated": new Date(),
        },
        { new: true }
      );
      if (!updatedProject) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project updated successfully",
        data: updatedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  get: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { tenant } = request.query;
      const project = await ProjectModel(tenant).findById(project_id).lean();
      if (!project) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project retrieved successfully",
        data: project,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  delete: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { tenant } = request.query;
      const deletedProject = await ProjectModel(tenant).findByIdAndUpdate(
        project_id,
        { isActive: false },
        { new: true }
      );
      if (!deletedProject) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project deleted successfully",
        data: deletedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  updateStatus: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { status } = request.body;
      const { tenant } = request.query;
      const updatedProject = await ProjectModel(tenant).findByIdAndUpdate(
        project_id,
        {
          status,
          "creator_info.last_updated": new Date(),
        },
        { new: true }
      );
      if (!updatedProject) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project status updated successfully",
        data: updatedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  updateMetrics: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { metrics } = request.body;
      const { tenant } = request.query;
      const updatedProject = await ProjectModel(tenant).findByIdAndUpdate(
        project_id,
        {
          metrics,
          "creator_info.last_updated": new Date(),
        },
        { new: true }
      );
      if (!updatedProject) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project metrics updated successfully",
        data: updatedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  addMilestone: async (request, next) => {
    try {
      const { project_id } = request.params;
      const { milestone } = request.body;
      const { tenant } = request.query;
      const updatedProject = await ProjectModel(tenant).findByIdAndUpdate(
        project_id,
        {
          $push: { milestones: milestone },
          "creator_info.last_updated": new Date(),
        },
        { new: true }
      );
      if (!updatedProject) {
        return next(
          new HttpError("Project not found", httpStatus.NOT_FOUND, {
            message: "Project with provided ID does not exist",
          })
        );
      }
      return {
        success: true,
        message: "Project milestone added successfully",
        data: updatedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  updateMilestoneStatus: async (request, next) => {
    try {
      const { project_id, milestone_id } = request.params;
      const { status } = request.body;
      const { tenant } = request.query;
      const updatedProject = await ProjectModel(tenant).findOneAndUpdate(
        {
          _id: project_id,
          "milestones._id": milestone_id,
        },
        {
          $set: {
            "milestones.$.status": status,
            "creator_info.last_updated": new Date(),
          },
        },
        { new: true }
      );
      if (!updatedProject) {
        return next(
          new HttpError(
            "Project or milestone not found",
            httpStatus.NOT_FOUND,
            { message: "Project or milestone with provided ID does not exist" }
          )
        );
      }
      return {
        success: true,
        message: "Project milestone status updated successfully",
        data: updatedProject,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
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
module.exports = project;
