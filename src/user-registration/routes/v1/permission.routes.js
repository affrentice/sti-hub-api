const express = require("express");
const PermissionController = require("@controllers/permission.controller");
const permissionValidations = require("@validators/permission.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");
const router = express.Router();
// CORS headers middleware
const headers = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
};
router.use(headers);
router.use(permissionValidations.pagination(100, 1000));
// Permission Routes
router.get(
  "/",
  permissionValidations.list,
  setJWTAuth,
  authJWT,
  PermissionController.list
);
router.post(
  "/",
  permissionValidations.create,
  setJWTAuth,
  authJWT,
  PermissionController.create
);
router.put(
  "/:permission_id",
  permissionValidations.checkEmptyBody,
  permissionValidations.update,
  setJWTAuth,
  authJWT,
  PermissionController.update
);
router.delete(
  "/:permission_id",
  permissionValidations.delete,
  setJWTAuth,
  authJWT,
  PermissionController.delete
);
router.get(
  "/:permission_id",
  permissionValidations.list,
  setJWTAuth,
  authJWT,
  PermissionController.list
);
module.exports = router;
