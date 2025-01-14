const express = require("express");
const router = express.Router();
const departmentController = require("@controllers/department.controller");
const {
  middlewareUtils,
  ...departmentValidations
} = require("@validators/department.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// Auth middleware group
const authMiddleware = [setJWTAuth, authJWT];

// List departments (with optional filtering)
router.get(
  "/",
  departmentValidations.list,
  authMiddleware,
  departmentController.list
);

// Create new department
router.post(
  "/",
  [
    ...departmentValidations.create,
    ...departmentValidations.title,
    ...departmentValidations.description,
    ...departmentValidations.manager,
    ...departmentValidations.users,
  ],
  authMiddleware,
  departmentController.create
);

// Update department
router.put(
  "/:department_id",
  [
    ...departmentValidations.update,
    ...departmentValidations.title,
    ...departmentValidations.description,
    ...departmentValidations.manager,
    ...departmentValidations.users,
  ],
  authMiddleware,
  departmentController.update
);

// Get single department
router.get(
  "/:department_id",
  departmentValidations.departmentId,
  authMiddleware,
  departmentController.get
);

// Delete department
router.delete(
  "/:department_id",
  departmentValidations.departmentId,
  authMiddleware,
  departmentController.delete
);

// Activate/deactivate department
router.patch(
  "/:department_id/status",
  [...departmentValidations.departmentId, ...departmentValidations.status],
  authMiddleware,
  departmentController.updateStatus
);

// Add users to department
router.post(
  "/:department_id/users",
  [...departmentValidations.departmentId, ...departmentValidations.users],
  authMiddleware,
  departmentController.addUsers
);

// Remove users from department
router.delete(
  "/:department_id/users",
  [...departmentValidations.departmentId, ...departmentValidations.users],
  authMiddleware,
  departmentController.removeUsers
);

// Update department manager
router.patch(
  "/:department_id/manager",
  [...departmentValidations.departmentId, ...departmentValidations.manager],
  authMiddleware,
  departmentController.updateManager
);

module.exports = router;
