const {
  logObject,
  logText,
  logElement,
  HttpError,
  extractErrorsFromRequest,
} = require("@utils/shared");
const constants = require("@config/constants");
const isEmpty = require("is-empty");
const httpStatus = require("http-status");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- user-controller`);
const userUtil = require("@utils/user.util");

const users = {
  registerUser: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const request = req;
      const defaultTenant = constants.DEFAULT_TENANT || "sti";
      request.query.tenant = isEmpty(req.query.tenant)
        ? defaultTenant
        : req.query.tenant;

      const result = await userUtil.register(request, next);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.CREATED;
        return res.status(status).json({
          success: true,
          message: "User registered successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "User registration failed" },
        });
      }
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
      return;
    }
  },
  getBulkUsers: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const request = req;
      const defaultTenant = constants.DEFAULT_TENANT || "sti";
      request.query.tenant = isEmpty(req.query.tenant)
        ? defaultTenant
        : req.query.tenant;

      const result = await userUtil.getBulkUsers(request, next);
      if (isEmpty(result) || res.headersSent) return;

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: result.message,
          users: result.data,
        });
      } else {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message,
          errors: result.errors
            ? result.errors
            : { message: "Internal Server Error" },
        });
      }
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
      return;
    }
  },
  completeProfile: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.completeUserProfile(req.user._id, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Profile completed successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Profile completion failed" },
        });
      }
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
      return;
    }
  },

  verifyEmail: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.verifyUserEmail(req.params.token);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Email verified successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Email verification failed" },
        });
      }
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
      return;
    }
  },

  login: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.loginUser(req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Login successful",
          token: result.token,
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.UNAUTHORIZED;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors ? result.errors : { message: "Login failed" },
        });
      }
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
      return;
    }
  },

  googleAuth: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.handleGoogleAuth(req.body.token);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Google authentication successful",
          token: result.token,
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.UNAUTHORIZED;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Google authentication failed" },
        });
      }
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
      return;
    }
  },

  getUserProfile: async (req, res, next) => {
    try {
      const result = await userUtil.getUserProfile(req.user._id);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Profile retrieved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Profile not found" },
        });
      }
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
      return;
    }
  },

  updateProfile: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.updateUserProfile(req.user._id, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Profile updated successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Profile update failed" },
        });
      }
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
      return;
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.changeUserPassword(req.user._id, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Password changed successfully",
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.UNAUTHORIZED;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Password change failed" },
        });
      }
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
      return;
    }
  },

  requestPasswordReset: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.initiatePasswordReset(req.body.email);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Password reset email sent successfully",
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Password reset request failed" },
        });
      }
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
      return;
    }
  },

  resetPassword: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.resetPassword(
        req.params.token,
        req.body.password
      );

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Password reset successful",
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Password reset failed" },
        });
      }
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
      return;
    }
  },

  updatePublicProfile: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.updatePublicProfile(req.user._id, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Public profile updated successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status
          ? result.status
          : httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Public profile update failed" },
        });
      }
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
      return;
    }
  },

  getPublicProfile: async (req, res, next) => {
    try {
      logText("we are inside the getPublicProfile... ");
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.getPublicProfile(req.params.userId);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Public profile retrieved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Profile not found" },
        });
      }
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
      return;
    }
  },

  connectWithUser: async (req, res, next) => {
    try {
      logText("we are inside the connectWithUser... ");
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.createConnection(
        req.user._id,
        req.params.userId
      );

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Connection request sent successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Connection request failed" },
        });
      }
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
      return;
    }
  },

  getUserConnections: async (req, res, next) => {
    try {
      const result = await userUtil.getConnections(req.user._id);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Connections retrieved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "No connections found" },
        });
      }
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
      return;
    }
  },

  updateAccountStatus: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.updateStatus(req.user._id, req.body.status);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Account status updated successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Status update failed" },
        });
      }
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
      return;
    }
  },

  deleteAccount: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.deleteUserAccount(req.user._id);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Account deleted successfully",
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Account deletion failed" },
        });
      }
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
      return;
    }
  },

  getUserAnalytics: async (req, res, next) => {
    try {
      const result = await userUtil.getAnalytics(req.user._id);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Analytics retrieved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Analytics not found" },
        });
      }
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
      return;
    }
  },

  saveProfileDraft: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.saveDraft(req.user._id, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Profile draft saved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors
            ? result.errors
            : { message: "Failed to save draft" },
        });
      }
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
      return;
    }
  },

  getProfileDraft: async (req, res, next) => {
    try {
      const result = await userUtil.getDraft(req.user._id);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Profile draft retrieved successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors ? result.errors : { message: "No draft found" },
        });
      }
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
      return;
    }
  },

  listUsers: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.getAllUsers(req.query);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "Users retrieved successfully",
          data: result.data,
          pagination: result.pagination,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.NOT_FOUND;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors ? result.errors : { message: "No users found" },
        });
      }
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
      return;
    }
  },

  adminUpdateUser: async (req, res, next) => {
    try {
      const errors = extractErrorsFromRequest(req);
      if (errors) {
        next(
          new HttpError("bad request errors", httpStatus.BAD_REQUEST, errors)
        );
        return;
      }

      const result = await userUtil.adminUpdate(req.params.userId, req.body);

      if (isEmpty(result) || res.headersSent) {
        return;
      }

      if (result.success === true) {
        const status = result.status ? result.status : httpStatus.OK;
        return res.status(status).json({
          success: true,
          message: "User updated successfully",
          data: result.data,
        });
      } else if (result.success === false) {
        const status = result.status ? result.status : httpStatus.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message ? result.message : "",
          errors: result.errors ? result.errors : { message: "Update failed" },
        });
      }
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
      return;
    }
  },
};

module.exports = users;
