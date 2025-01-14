const { UserModel } = require("@models/User");
const { HttpError } = require("@utils/shared");
const { mailer } = require("@utils/common");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- user-util`);

const user = {
  register: async (request, next) => {
    try {
      const { registrationData, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const responseFromRegister = await UserModel(tenant).register(
        registrationData,
        next
      );
      return responseFromRegister;
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

  completeProfile: async (request, next) => {
    try {
      const { profileData, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const userId = user._id;

      const updateResponse = await UserModel(tenant).updateById(
        userId,
        {
          ...profileData,
          profileComplete: true,
        },
        next
      );

      return updateResponse;
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

  verifyEmail: async (request, next) => {
    try {
      const { token, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      // Verify token and get user id
      const decoded = jwt.verify(token, constants.JWT_SECRET);

      const updateResponse = await UserModel(tenant).updateById(
        decoded._id,
        {
          verified: true,
        },
        next
      );

      return updateResponse;
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(new HttpError("Invalid or expired token", httpStatus.BAD_REQUEST));
    }
  },

  login: async (request, next) => {
    try {
      const { email, password, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const findUserResponse = await UserModel(tenant).findByEmail(email, next);

      if (!findUserResponse.success) {
        return {
          success: false,
          message: "Invalid credentials",
          status: httpStatus.UNAUTHORIZED,
        };
      }

      const user = findUserResponse.data;
      const isPasswordValid = await user.verifyPassword(password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: "Invalid credentials",
          status: httpStatus.UNAUTHORIZED,
        };
      }

      await UserModel(tenant).updateLoginStats(user._id, next);
      const authResponse = await user.toAuthJSON();

      return {
        success: true,
        message: "Login successful",
        data: authResponse,
        status: httpStatus.OK,
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

  googleAuth: async (request, next) => {
    try {
      const { token, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const { email, name, picture } = ticket.getPayload();

      let user = await UserModel(tenant).findOne({ email });

      if (!user) {
        // Register new user
        const [firstName, ...lastNameParts] = name.split(" ");
        const lastName = lastNameParts.join(" ");

        const registrationData = {
          email,
          firstName,
          lastName,
          google_id: ticket.getUserId(),
          profilePicture: picture,
          verified: true,
        };

        const registerResponse = await UserModel(tenant).register(
          registrationData,
          next
        );
        user = registerResponse.data;
      }

      const authResponse = await user.toAuthJSON();
      return {
        success: true,
        message: "Google authentication successful",
        data: authResponse,
        status: httpStatus.OK,
      };
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError("Google authentication failed", httpStatus.UNAUTHORIZED)
      );
    }
  },

  getUserProfile: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const userDetails = await UserModel(tenant).findById(userId);
      return {
        success: true,
        data: userDetails.getPublicProfile(),
        message: "Profile retrieved successfully",
        status: httpStatus.OK,
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

  updateProfile: async (request, next) => {
    try {
      const { user, updateData, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const responseFromUpdate = await UserModel(tenant).updateById(
        userId,
        updateData,
        next
      );
      return responseFromUpdate;
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

  changePassword: async (request, next) => {
    try {
      const { currentPassword, newPassword, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const user = await UserModel(tenant).findById(request.user._id);
      await user.changePassword(currentPassword, newPassword);
      return {
        success: true,
        message: "Password changed successfully",
        status: httpStatus.OK,
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

  requestPasswordReset: async (request, next) => {
    try {
      const { email, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const findUserResponse = await UserModel(tenant).findByEmail(email, next);

      if (!findUserResponse.success) {
        return findUserResponse;
      }

      const user = findUserResponse.data;
      const resetToken = await user.generatePasswordResetToken();
      await mailer.sendPasswordResetEmail(
        { email: user.email, token: resetToken },
        next
      );

      return {
        success: true,
        message: "Password reset instructions sent to email",
        status: httpStatus.OK,
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

  resetPassword: async (request, next) => {
    try {
      const { token, newPassword, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const user = await UserModel(tenant).findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return {
          success: false,
          message: "Invalid or expired reset token",
          status: httpStatus.BAD_REQUEST,
        };
      }

      user.password = await bcrypt.hash(newPassword, 10);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();

      return {
        success: true,
        message: "Password reset successful",
        status: httpStatus.OK,
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

  updatePublicProfile: async (request, next) => {
    try {
      const { profileData, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const userId = user._id;

      const response = await UserModel(tenant).findOneAndUpdate(
        { user: userId },
        { $set: profileData },
        { new: true, upsert: true }
      );

      return {
        success: true,
        data: response,
        message: "Public profile updated successfully",
        status: httpStatus.OK,
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

  connectWithUser: async (request, next) => {
    try {
      const { userId, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const requestingUserId = user._id;

      const updateResponse = await UserModel(tenant).updateById(
        requestingUserId,
        {
          $addToSet: { connections: userId },
        },
        next
      );

      return updateResponse;
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

  getUserConnections: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const userId = user._id;
      const userDetails = await UserModel(tenant)
        .findById(userId)
        .populate("connections");

      return {
        success: true,
        data: userDetails.connections,
        message: "Connections retrieved successfully",
        status: httpStatus.OK,
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

  updateAccountStatus: async (request, next) => {
    try {
      const { user, status, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const updateResponse = await UserModel(tenant).updateById(
        userId,
        {
          status,
        },
        next
      );

      return updateResponse;
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

  deleteAccount: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const deleteResponse = await UserModel(tenant).deleteById(userId, next);
      return deleteResponse;
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

  getUserAnalytics: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const userId = user._id;
      const userDetails = await UserModel(tenant).findById(userId);

      const analytics = {
        loginCount: userDetails.loginCount,
        lastLogin: userDetails.lastLogin,
        profileCompletion: userDetails.profileComplete ? 100 : 0,
        connectionsCount: userDetails.connections
          ? userDetails.connections.length
          : 0,
        accountAge: new Date() - userDetails.createdAt,
        status: userDetails.status,
      };

      return {
        success: true,
        data: analytics,
        message: "Analytics retrieved successfully",
        status: httpStatus.OK,
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

  saveProfileDraft: async (request, next) => {
    try {
      const { user, draftData, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const updateResponse = await UserModel(tenant).updateById(
        userId,
        {
          profileDraft: draftData,
        },
        next
      );

      return updateResponse;
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

  getProfileDraft: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };
      const userId = user._id;
      const userDetails = await UserModel(tenant)
        .findById(userId)
        .select("profileDraft");

      return {
        success: true,
        data: userDetails.profileDraft,
        message: "Profile draft retrieved successfully",
        status: httpStatus.OK,
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

  adminListUsers: async (request, next) => {
    try {
      const { skip, limit, filter, sort, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const response = await UserModel(tenant).list(
        { skip, limit, filter, sort },
        next
      );
      return response;
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

  adminUpdateUser: async (request, next) => {
    try {
      const { userId, updateData, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const updateResponse = await UserModel(tenant).updateById(
        userId,
        updateData,
        next
      );
      return updateResponse;
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
  getBulkUsers: async (request, next) => {
    try {
      const { userIds, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const users = await UserModel(tenant).retrieveUsersInBulk(userIds, {
        fields: "firstName lastName email userType status profilePicture",
        lean: true,
        batchSize: 1000,
        ...options,
      });
      return {
        success: true,
        data: users,
        message: "Users retrieved successfully",
        status: httpStatus.OK,
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

module.exports = user;
