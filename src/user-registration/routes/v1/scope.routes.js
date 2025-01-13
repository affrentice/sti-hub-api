const express = require("express");
const router = express.Router();
const createScopeController = require("@controllers/scope.controller");
const { setJWTAuth, authJWT } = require("@middleware/passport");
const {
  validatePagination,
  headers,
  validateTenant,
  validateScopeId,
  validateCreateScope,
  validateUpdateScope,
} = require("@validators/scope.validators");
// Apply middleware
router.use(headers);
router.use(validatePagination);
// List all scopes
router.get(
  "/",
  validateTenant,
  setJWTAuth,
  authJWT,
  createScopeController.list
);
// Create new scope
router.post(
  "/",
  validateTenant,
  validateCreateScope,
  setJWTAuth,
  authJWT,
  createScopeController.create
);
// Update scope
router.put(
  "/:scope_id",
  (req, res, next) => {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ errors: "request body is empty" });
    }
    next();
  },
  validateTenant,
  validateScopeId,
  validateUpdateScope,
  setJWTAuth,
  authJWT,
  createScopeController.update
);
// Delete scope
router.delete(
  "/:scope_id",
  validateTenant,
  validateScopeId,
  setJWTAuth,
  authJWT,
  createScopeController.delete
);
// Get single scope
router.get(
  "/:scope_id",
  validateTenant,
  validateScopeId,
  setJWTAuth,
  authJWT,
  createScopeController.list
);
module.exports = router;
