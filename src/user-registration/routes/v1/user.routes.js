const express = require("express");
const UserController = require("@controllers/user.controller");
const userValidations = require("@validators/user.validators");
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
router.use(userValidations.pagination(50, 500));

// User Registration
router.post(
  "/register",
  userValidations.registration,
  UserController.registerUser
);

// Complete Profile Based on User Type
router.post(
  "/complete-profile",
  userValidations.profileCompletion,
  setJWTAuth,
  authJWT,
  UserController.completeProfile
);

// Email Verification
router.post(
  "/verify-email/:token",
  userValidations.verificationToken,
  UserController.verifyEmail
);

// User Login
router.post("/login", userValidations.login, UserController.login);

// Google OAuth Login/Registration
router.post(
  "/oauth/google",
  userValidations.googleAuth,
  UserController.googleAuth
);

// Get User Profile
router.get("/profile", setJWTAuth, authJWT, UserController.getUserProfile);

// Update User Profile
router.patch(
  "/profile/update",
  userValidations.profileUpdate,
  setJWTAuth,
  authJWT,
  UserController.updateProfile
);

// Change Password
router.post(
  "/change-password",
  userValidations.passwordChange,
  setJWTAuth,
  authJWT,
  UserController.changePassword
);

// Reset Password Request
router.post(
  "/reset-password-request",
  userValidations.resetPasswordRequest,
  UserController.requestPasswordReset
);

// Reset Password
router.post(
  "/reset-password/:token",
  userValidations.resetPassword,
  UserController.resetPassword
);

// Manage Public Profile
router.patch(
  "/public-profile",
  userValidations.publicProfile,
  setJWTAuth,
  authJWT,
  UserController.updatePublicProfile
);

// Connect with Other Users
router.post(
  "/connect/:userId",
  userValidations.userId,
  setJWTAuth,
  authJWT,
  UserController.connectWithUser
);

// Get Public Profile
router.get(
  "/public-profile/:userId",
  userValidations.userId,
  UserController.getPublicProfile
);

// Get User Connections
router.get(
  "/connections",
  setJWTAuth,
  authJWT,
  UserController.getUserConnections
);

// Update Account Status
router.patch(
  "/status",
  userValidations.accountStatus,
  setJWTAuth,
  authJWT,
  UserController.updateAccountStatus
);

// Delete Account
router.delete(
  "/delete-account",
  userValidations.accountDeletion,
  setJWTAuth,
  authJWT,
  UserController.deleteAccount
);

// Get User Analytics
router.get("/analytics", setJWTAuth, authJWT, UserController.getUserAnalytics);

// Save Profile Draft
router.post(
  "/profile/draft",
  userValidations.profileDraft,
  setJWTAuth,
  authJWT,
  UserController.saveProfileDraft
);

// Get Profile Draft
router.get(
  "/profile/draft",
  setJWTAuth,
  authJWT,
  UserController.getProfileDraft
);

// Administrative Routes
router.get(
  "/admin/users",
  userValidations.adminOperation,
  setJWTAuth,
  authJWT,
  UserController.listUsers
);

router.patch(
  "/admin/user/:userId",
  userValidations.adminUserUpdate,
  setJWTAuth,
  authJWT,
  UserController.adminUpdateUser
);

module.exports = router;
