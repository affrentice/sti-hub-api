const express = require("express");
const DirectoryController = require("@controllers/directory.controller");
const directoryValidations = require("@validators/directory.validators");
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
router.use(directoryValidations.pagination(50, 500));

// Investor Directory Routes
router.get(
  "/investors",
  directoryValidations.searchInvestors,
  setJWTAuth,
  authJWT,
  DirectoryController.listInvestors
);

router.get(
  "/investors/:id",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getInvestorDetails
);

router.get(
  "/investors/:id/portfolio",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getInvestorPortfolio
);

// Financial Institution Directory Routes
router.get(
  "/financial-institutions",
  directoryValidations.searchFinancialInstitutions,
  setJWTAuth,
  authJWT,
  DirectoryController.listFinancialInstitutions
);

router.get(
  "/financial-institutions/:id",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getFinancialInstitutionDetails
);

router.get(
  "/financial-institutions/:id/opportunities",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getFinancingOpportunities
);

// BDS Provider Directory Routes
router.get(
  "/bds-providers",
  directoryValidations.searchBDSProviders,
  setJWTAuth,
  authJWT,
  DirectoryController.listBDSProviders
);

router.get(
  "/bds-providers/:id",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getBDSProviderDetails
);

router.get(
  "/bds-providers/:id/services",
  directoryValidations.idOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getBDSProviderServices
);

// Connection Management Routes
router.post(
  "/connect/:type/:id",
  directoryValidations.connectionRequest,
  setJWTAuth,
  authJWT,
  DirectoryController.createConnection
);

router.delete(
  "/disconnect/:type/:id",
  directoryValidations.connectionRequest,
  setJWTAuth,
  authJWT,
  DirectoryController.removeConnection
);

// Recommendation Routes
router.post(
  "/:type/:id/recommend",
  directoryValidations.recommendation,
  setJWTAuth,
  authJWT,
  DirectoryController.createRecommendation
);

// Analytics and Stats Routes
router.get(
  "/stats/:type",
  directoryValidations.statsOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.getDirectoryStats
);

// Search and Filter Routes
router.post(
  "/search",
  directoryValidations.advancedSearch,
  setJWTAuth,
  authJWT,
  DirectoryController.advancedSearch
);

// Profile Visibility Management
router.patch(
  "/visibility/:type/:id",
  directoryValidations.visibilityUpdate,
  setJWTAuth,
  authJWT,
  DirectoryController.updateVisibility
);

// Feedback Routes
router.post(
  "/feedback/:type/:id",
  directoryValidations.feedback,
  setJWTAuth,
  authJWT,
  DirectoryController.submitFeedback
);

// Export Directory Data
router.get(
  "/export/:type",
  directoryValidations.exportOperation,
  setJWTAuth,
  authJWT,
  DirectoryController.exportDirectoryData
);

module.exports = router;
