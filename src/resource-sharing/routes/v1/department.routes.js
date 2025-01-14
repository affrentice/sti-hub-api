const express = require("express");
const router = express.Router();
const departmentController = require("@controllers/department.controller");
const {
  middlewareUtils,
  ...departmentValidations
} = require("@validators/department.validators");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// List departments (with optional filtering)
router.get(
  "/",
  departmentValidations.list,

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

  departmentController.update
);

// Get single department
router.get(
  "/:department_id",
  departmentValidations.departmentId,

  departmentController.get
);

// Delete department
router.delete(
  "/:department_id",
  departmentValidations.departmentId,

  departmentController.delete
);

// Activate/deactivate department
router.patch(
  "/:department_id/status",
  [...departmentValidations.departmentId, ...departmentValidations.status],

  departmentController.updateStatus
);

// Add users to department
router.post(
  "/:department_id/users",
  [...departmentValidations.departmentId, ...departmentValidations.users],

  departmentController.addUsers
);

// Remove users from department
router.delete(
  "/:department_id/users",
  [...departmentValidations.departmentId, ...departmentValidations.users],

  departmentController.removeUsers
);

// Update department manager
router.patch(
  "/:department_id/manager",
  [...departmentValidations.departmentId, ...departmentValidations.manager],

  departmentController.updateManager
);

module.exports = router;
