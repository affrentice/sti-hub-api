const express = require("express");
const RequestController = require("@controllers/request.controller");
const requestValidations = require("@validators/request.validators");
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
router.use(requestValidations.pagination(100, 1000));
// Group Access Request Routes
router.post(
  "/groups/:grp_id",
  requestValidations.requestGroupAccess,
  setJWTAuth,
  authJWT,
  RequestController.requestAccessToGroup
);
router.post(
  "/emails/groups/:grp_id",
  requestValidations.requestGroupAccessByEmail,
  setJWTAuth,
  authJWT,
  RequestController.requestAccessToGroupByEmail
);
// Email Invitation Routes
router.post(
  "/emails/accept",
  requestValidations.acceptInvitation,
  setJWTAuth,
  authJWT,
  RequestController.acceptInvitation
);
// Network Access Request Routes
router.post(
  "/networks/:net_id",
  requestValidations.requestNetworkAccess,
  setJWTAuth,
  authJWT,
  RequestController.requestAccessToNetwork
);
// List Routes
router.get(
  "/",
  requestValidations.list,
  setJWTAuth,
  authJWT,
  RequestController.list
);
router.get(
  "/pending",
  requestValidations.list,
  setJWTAuth,
  authJWT,
  RequestController.listPendingAccessRequests
);
router.get(
  "/groups",
  requestValidations.list,
  setJWTAuth,
  authJWT,
  RequestController.listAccessRequestsForGroup
);
router.get(
  "/networks",
  requestValidations.list,
  setJWTAuth,
  authJWT,
  RequestController.listAccessRequestsForNetwork
);
// Request Management Routes
router.post(
  "/:request_id/approve",
  requestValidations.approveReject,
  setJWTAuth,
  authJWT,
  RequestController.approveAccessRequest
);
router.post(
  "/:request_id/reject",
  requestValidations.approveReject,
  setJWTAuth,
  authJWT,
  RequestController.rejectAccessRequest
);
router.delete(
  "/:request_id",
  requestValidations.delete,
  setJWTAuth,
  authJWT,
  RequestController.delete
);
router.put(
  "/:request_id",
  requestValidations.update,
  setJWTAuth,
  authJWT,
  RequestController.update
);
// Specific Resource Access Requests
router.get(
  "/groups/:grp_id",
  requestValidations.listByGroup,
  setJWTAuth,
  authJWT,
  RequestController.listAccessRequestsForGroup
);
router.get(
  "/networks/:net_id",
  requestValidations.listByNetwork,
  setJWTAuth,
  authJWT,
  RequestController.listAccessRequestsForNetwork
);
router.get(
  "/request_id",
  requestValidations.delete,
  setJWTAuth,
  authJWT,
  RequestController.list
);
module.exports = router;
