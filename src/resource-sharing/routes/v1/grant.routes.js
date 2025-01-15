const express = require("express");
const router = express.Router();
const grantController = require("@controllers/grant.controller");
const {
  middlewareUtils,
  grantValidations,
} = require("@validators/grant.validators");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// List grants (with filtering)
router.get("/", grantValidations.list, grantController.list);

// Create new grant
router.post(
  "/",
  [
    ...grantValidations.create,
    ...grantValidations.title,
    ...grantValidations.description,
    ...grantValidations.amount,
    ...grantValidations.deadline,
    ...grantValidations.eligibilityCriteria,
    ...grantValidations.sector,
    ...grantValidations.applicationProcess,
    ...grantValidations.documentsRequired,
  ],
  grantController.create
);

// Update grant
router.put(
  "/:grant_id",
  [
    ...grantValidations.grantId,
    ...grantValidations.update,
    ...grantValidations.title,
    ...grantValidations.description,
    ...grantValidations.amount,
    ...grantValidations.deadline,
    ...grantValidations.eligibilityCriteria,
    ...grantValidations.sector,
    ...grantValidations.applicationProcess,
    ...grantValidations.documentsRequired,
  ],
  grantController.update
);

// Get single grant
router.get("/:grant_id", grantValidations.grantId, grantController.get);

// Delete grant
router.delete("/:grant_id", grantValidations.grantId, grantController.delete);

// Update grant status
router.patch(
  "/:grant_id/status",
  [...grantValidations.grantId, ...grantValidations.status],
  grantController.updateStatus
);

// Update required documents
router.patch(
  "/:grant_id/documents",
  [...grantValidations.grantId, ...grantValidations.documentsRequired],
  grantController.updateDocuments
);

module.exports = router;
