const { PublicProfileModel } = require("@models/Actor");
const { HttpError } = require("@utils/shared");
const httpStatus = require("http-status");
const constants = require("@config/constants");
const log4js = require("log4js");
const { isEmpty } = require("lodash");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- profile-util`);

const profile = {
  createPublicProfile: async (request, next) => {
    try {
      const { profileData, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      // Check if profile already exists
      const existingProfile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (existingProfile) {
        return await PublicProfileModel(tenant).updateById(
          existingProfile._id,
          profileData,
          next
        );
      }

      const newProfile = await PublicProfileModel(tenant).create({
        ...profileData,
        user: user._id,
      });

      return newProfile;
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

  updateProfileVisibility: async (request, next) => {
    try {
      const { visibility, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      const updatedProfile = await PublicProfileModel(tenant).updateById(
        profile._id,
        { visibility },
        next
      );

      return updatedProfile;
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

  addAchievement: async (request, next) => {
    try {
      const { achievement, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      profile.achievements.push(achievement);
      await profile.save();

      return profile;
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

  removeAchievement: async (request, next) => {
    try {
      const { achievementId, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      profile.achievements = profile.achievements.filter(
        (achievement) => achievement._id.toString() !== achievementId
      );
      await profile.save();

      return profile;
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

  updateSkills: async (request, next) => {
    try {
      const { skills, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      const updatedProfile = await PublicProfileModel(tenant).updateById(
        profile._id,
        { skills },
        next
      );

      return updatedProfile;
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

  updateSocialLinks: async (request, next) => {
    try {
      const { socialLinks, user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant).findOne({
        user: user._id,
      });

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      const updatedProfile = await PublicProfileModel(tenant).updateById(
        profile._id,
        { socialLinks },
        next
      );

      return updatedProfile;
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

  searchProfiles: async (request, next) => {
    try {
      const { query, filters, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const searchCriteria = {};
      if (query) {
        searchCriteria.$or = [
          { headline: { $regex: query, $options: "i" } },
          { bio: { $regex: query, $options: "i" } },
          { skills: { $in: [new RegExp(query, "i")] } },
        ];
      }

      if (filters?.visibility) {
        searchCriteria.visibility = filters.visibility;
      }

      const profiles = await PublicProfileModel(tenant)
        .find(searchCriteria)
        .populate("user", "firstName lastName email userType");

      return profiles;
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

  getProfileStats: async (request, next) => {
    try {
      const { user, tenant } = {
        ...request.body,
        ...request.query,
        ...request.params,
      };

      const profile = await PublicProfileModel(tenant)
        .findOne({ user: user._id })
        .populate("user", "userType");

      if (!profile) {
        throw new HttpError("Profile not found", httpStatus.NOT_FOUND);
      }

      // Calculate profile completeness
      const requiredFields = ["headline", "bio", "skills", "socialLinks"];
      const completedFields = requiredFields.filter(
        (field) => !isEmpty(profile[field])
      );
      const completeness =
        (completedFields.length / requiredFields.length) * 100;

      return {
        profileViews: profile.profileViews || 0,
        achievementsCount: profile.achievements.length,
        skillsCount: profile.skills.length,
        completeness: Math.round(completeness),
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

module.exports = profile;
