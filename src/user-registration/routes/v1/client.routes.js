const express = require("express");
const router = express.Router();
const createClientController = require("@controllers/client.controller");
const {
  middlewareUtils,
  ...clientValidations
} = require("@validators/client.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");
// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);
// Auth middleware group
const authMiddleware = [setJWTAuth, authJWT];
// Routes with grouped validations
router.get(
  "/",
  clientValidations.list,
  authMiddleware,
  createClientController.list
);
router.post(
  "/",
  [
    ...clientValidations.create,
    ...clientValidations.name,
    ...clientValidations.ipAddress,
    ...clientValidations.ipAddresses,
    ...clientValidations.redirectUrl,
  ],
  authMiddleware,
  createClientController.create
);
router.patch(
  "/:client_id/secret",
  clientValidations.update,
  authMiddleware,
  createClientController.updateClientSecret
);
router.put(
  "/:client_id",
  clientValidations.update,
  authMiddleware,
  createClientController.update
);
router.post(
  "/activate/:client_id",
  [...clientValidations.update, ...clientValidations.isActive],
  authMiddleware,
  createClientController.activateClient
);
router.get(
  "/activate-request/:client_id",
  clientValidations.update,
  authMiddleware,
  createClientController.activateClientRequest
);
router.delete(
  "/:client_id",
  clientValidations.update,
  authMiddleware,
  createClientController.delete
);
router.get(
  "/:client_id",
  clientValidations.update,
  authMiddleware,
  createClientController.list
);
module.exports = router;
