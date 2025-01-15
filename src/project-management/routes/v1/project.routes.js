const express = require("express");
const router = express.Router();
const projectController = require("@controllers/project.controller");
const {
  middlewareUtils,
  projectValidations,
} = require("@validators/project.validators");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// List projects (with filtering)
router.get("/", projectValidations.list, projectController.list);

// Create new project
router.post(
  "/",
  [
    ...projectValidations.create,
    ...projectValidations.title,
    ...projectValidations.description,
    ...projectValidations.budget,
    ...projectValidations.timeline,
    ...projectValidations.stakeholders,
  ],
  projectController.create
);

// Update project
router.put(
  "/:project_id",
  [
    ...projectValidations.projectId,
    ...projectValidations.update,
    ...projectValidations.title,
    ...projectValidations.description,
    ...projectValidations.budget,
    ...projectValidations.timeline,
    ...projectValidations.stakeholders,
  ],
  projectController.update
);

// Get single project
router.get("/:project_id", projectValidations.projectId, projectController.get);

// Delete project
router.delete(
  "/:project_id",
  projectValidations.projectId,
  projectController.delete
);

// Update project status
router.patch(
  "/:project_id/status",
  [...projectValidations.projectId, ...projectValidations.status],
  projectController.updateStatus
);

// Update project metrics
router.patch(
  "/:project_id/metrics",
  [...projectValidations.projectId, ...projectValidations.metrics],
  projectController.updateMetrics
);

// Add project milestone
router.post(
  "/:project_id/milestones",
  [...projectValidations.projectId, ...projectValidations.milestone],
  projectController.addMilestone
);

// Update milestone status
router.patch(
  "/:project_id/milestones/:milestone_id",
  [
    ...projectValidations.projectId,
    ...projectValidations.milestoneId,
    ...projectValidations.milestoneStatus,
  ],
  projectController.updateMilestoneStatus
);

module.exports = router;
