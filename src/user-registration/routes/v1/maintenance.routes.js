const express = require("express");
const MaintenanceController = require("@controllers/maintenance.controller");
const maintenanceValidations = require("@validators/maintenance.validators");
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

// Product middleware
const setProductQueryParam = (product) => (req, res, next) => {
  req.query.product = product;
  next();
};

router.use(headers);
router.use(maintenanceValidations.pagination(100));

// Define routes for each product (mobile, website, analytics)
const products = ["mobile", "website", "analytics"];

products.forEach((product) => {
  // Create Maintenance
  router.post(
    `/${product}`,
    setProductQueryParam(product),
    maintenanceValidations.createMaintenance,
    setJWTAuth,
    authJWT,
    MaintenanceController.create
  );

  // Update Maintenance
  router.put(
    `/${product}`,
    setProductQueryParam(product),
    maintenanceValidations.updateMaintenance,
    setJWTAuth,
    authJWT,
    MaintenanceController.update
  );

  // List Maintenance
  router.get(
    `/${product}`,
    setProductQueryParam(product),
    maintenanceValidations.listMaintenance,
    MaintenanceController.list
  );

  // Delete Maintenance
  router.delete(
    `/${product}`,
    setProductQueryParam(product),
    maintenanceValidations.deleteMaintenance,
    setJWTAuth,
    authJWT,
    MaintenanceController.delete
  );
});

module.exports = router;
