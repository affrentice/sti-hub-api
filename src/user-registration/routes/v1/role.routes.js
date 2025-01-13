const express = require("express");
const router = express.Router();
const createRoleController = require("@controllers/role.controller");
const { setJWTAuth, authJWT } = require("@middleware/passport");
const {
  list,
  create,
  update,
  assignUsers,
  assignPermissions,
  headers,
  pagination,
  tenant,
  roleId,
  userId,
  permissionId,
} = require("@validators/role.validators");

// Apply middleware
router.use(headers);
router.use(pagination());

// Role management routes
router.get("/", list, setJWTAuth, authJWT, createRoleController.list);
router.get(
  "/summary",
  tenant,
  setJWTAuth,
  authJWT,
  createRoleController.listSummary
);
router.post("/", create, setJWTAuth, authJWT, createRoleController.create);
router.put(
  "/:role_id",
  update,
  setJWTAuth,
  authJWT,
  createRoleController.update
);
router.delete(
  "/:role_id",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.delete
);

// User assignment routes
router.get(
  "/:role_id/users",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.listUsersWithRole
);
router.get(
  "/:role_id/available_users",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.listAvailableUsersForRole
);
router.post(
  "/:role_id/users",
  assignUsers,
  setJWTAuth,
  authJWT,
  createRoleController.assignManyUsersToRole
);
router.post(
  "/:role_id/user",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.assignUserToRole
);
router.put(
  "/:role_id/user/:user_id",
  [...tenant, ...roleId, ...userId],
  setJWTAuth,
  authJWT,
  createRoleController.assignUserToRole
);
router.delete(
  "/:role_id/users",
  assignUsers,
  setJWTAuth,
  authJWT,
  createRoleController.unAssignManyUsersFromRole
);
router.delete(
  "/:role_id/user/:user_id",
  [...tenant, ...roleId, ...userId],
  setJWTAuth,
  authJWT,
  createRoleController.unAssignUserFromRole
);

// Permission management routes
router.get(
  "/:role_id/permissions",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.listPermissionsForRole
);
router.get(
  "/:role_id/available_permissions",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.listAvailablePermissionsForRole
);
router.post(
  "/:role_id/permissions",
  assignPermissions,
  setJWTAuth,
  authJWT,
  createRoleController.assignPermissionToRole
);
router.put(
  "/:role_id/permissions",
  assignPermissions,
  setJWTAuth,
  authJWT,
  createRoleController.updateRolePermissions
);
router.delete(
  "/:role_id/permissions",
  assignPermissions,
  setJWTAuth,
  authJWT,
  createRoleController.unAssignManyPermissionsFromRole
);
router.delete(
  "/:role_id/permissions/:permission_id",
  [...tenant, ...roleId, ...permissionId],
  setJWTAuth,
  authJWT,
  createRoleController.unAssignPermissionFromRole
);

// Single role route
router.get(
  "/:role_id",
  [...tenant, ...roleId],
  setJWTAuth,
  authJWT,
  createRoleController.list
);

module.exports = router;
