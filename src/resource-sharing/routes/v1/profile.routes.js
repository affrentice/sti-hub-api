const express = require("express");
const ProfileController = require("@controllers/profile.controller");
const profileValidations = require("@validators/profile.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");

const router = express.Router();

// CORS headers middleware
const headers = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  next();
};

router.use(headers);
router.use(profileValidations.pagination(50, 500));

// Create/Update Public Profile
router.post(
  "/create",
  profileValidations.createProfile,
  ProfileController.createPublicProfile
);

// Get Public Profile
router.get(
  "/:userId/view",
  profileValidations.viewProfile,
  ProfileController.getPublicProfile
);

// Update Profile Visibility
router.patch(
  "/visibility",
  profileValidations.updateVisibility,
  ProfileController.updateProfileVisibility
);

// Add/Update Achievement
router.post(
  "/achievements",
  profileValidations.achievement,
  ProfileController.addAchievement
);

// Remove Achievement
router.delete(
  "/achievements/:achievementId",
  profileValidations.achievementId,
  ProfileController.removeAchievement
);

// Update Skills
router.patch(
  "/skills",
  profileValidations.skills,
  ProfileController.updateSkills
);

// Update Social Links
router.patch(
  "/social-links",
  profileValidations.socialLinks,
  ProfileController.updateSocialLinks
);

// Share Content
router.post(
  "/content/share",
  profileValidations.content,
  ProfileController.shareContent
);

// Get Shared Content
router.get(
  "/content/:userId",
  profileValidations.getUserContent,
  ProfileController.getSharedContent
);

// Search Profiles
router.get(
  "/search",
  profileValidations.searchProfiles,
  ProfileController.searchProfiles
);

// Get Profile Statistics
router.get(
  "/stats",
  profileValidations.profileStats,
  ProfileController.getProfileStats
);

// Get Profile Engagement Metrics
router.get(
  "/engagement",
  profileValidations.engagement,
  ProfileController.getEngagementMetrics
);

// Update Profile Theme
router.patch(
  "/theme",
  profileValidations.theme,
  ProfileController.updateProfileTheme
);

// Get Profile Recommendations
router.get(
  "/recommendations",
  profileValidations.recommendations,
  ProfileController.getProfileRecommendations
);

// Export Profile Data
router.get(
  "/export",
  profileValidations.exportProfile,
  ProfileController.exportProfileData
);

// Update Profile Privacy Settings
router.patch(
  "/privacy",
  profileValidations.privacy,
  ProfileController.updatePrivacySettings
);

module.exports = router;
