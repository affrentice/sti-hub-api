const express = require("express");
const GroupController = require("@controllers/group.controller");
const groupValidations = require("@validators/group.validators");
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
router.use(groupValidations.pagination(100, 1000));

// Group CRUD Operations
router.post(
  "/",
  groupValidations.createGroup,
  setJWTAuth,
  authJWT,
  GroupController.create
);
router.get("/", groupValidations.listGroups, GroupController.list);
router.get("/:grp_id", groupValidations.getGroup, GroupController.list);
router.put("/:grp_id", groupValidations.updateGroup, GroupController.update);
router.delete(
  "/:grp_id",
  groupValidations.deleteGroup,
  setJWTAuth,
  authJWT,
  GroupController.delete
);

// Group Summary
router.get(
  "/summary",
  groupValidations.listSummary,
  GroupController.listSummary
);

// User Management
router.get(
  "/:grp_id/assigned-users",
  groupValidations.getGroupUsers,
  GroupController.listAssignedUsers
);
router.get(
  "/:grp_id/all-users",
  groupValidations.getGroupUsers,
  GroupController.listAllGroupUsers
);
router.get(
  "/:grp_id/available-users",
  groupValidations.getGroupUsers,
  GroupController.listAvailableUsers
);
router.post(
  "/:grp_id/assign-users",
  groupValidations.assignUsers,
  setJWTAuth,
  authJWT,
  GroupController.assignUsers
);
router.put(
  "/:grp_id/assign-user/:user_id",
  groupValidations.assignOneUser,
  setJWTAuth,
  authJWT,
  GroupController.assignOneUser
);
router.delete(
  "/:grp_id/unassign-user/:user_id",
  groupValidations.unassignUser,
  setJWTAuth,
  authJWT,
  GroupController.unAssignUser
);
router.delete(
  "/:grp_id/unassign-many-users",
  groupValidations.unassignManyUsers,
  setJWTAuth,
  authJWT,
  GroupController.unAssignManyUsers
);

// Group Management
router.put(
  "/:grp_id/set-manager/:user_id",
  groupValidations.setManager,
  setJWTAuth,
  authJWT,
  GroupController.setManager
);
router.get(
  "/:grp_id/roles",
  groupValidations.listRoles,
  setJWTAuth,
  authJWT,
  GroupController.listRolesForGroup
);

// Maintenance
router.post(
  "/removeUniqueConstraints",
  groupValidations.removeConstraints,
  setJWTAuth,
  authJWT,
  GroupController.removeUniqueConstraint
);

module.exports = router;
