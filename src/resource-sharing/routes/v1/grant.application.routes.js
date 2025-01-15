const express = require("express");
const router = express.Router();
const grantApplicationController = require("@controllers/grant.application.controller");
const {
  middlewareUtils,
  grantApplicationValidations,
} = require("@validators/grant.application.validators");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// List applications (with filtering)
router.get(
  "/",
  grantApplicationValidations.list,
  grantApplicationController.list
);

// Submit new application
router.post(
  "/",
  [
    ...grantApplicationValidations.create,
    ...grantApplicationValidations.grantId,
    ...grantApplicationValidations.applicantInfo,
    ...grantApplicationValidations.documents,
  ],
  grantApplicationController.create
);

// Update application
router.put(
  "/:application_id",
  [
    ...grantApplicationValidations.applicationId,
    ...grantApplicationValidations.update,
    ...grantApplicationValidations.documents,
  ],
  grantApplicationController.update
);

// Get single application
router.get(
  "/:application_id",
  grantApplicationValidations.applicationId,
  grantApplicationController.get
);

// Update application status
router.patch(
  "/:application_id/status",
  [
    ...grantApplicationValidations.applicationId,
    ...grantApplicationValidations.status,
  ],
  grantApplicationController.updateStatus
);

// Add review notes
router.post(
  "/:application_id/reviews",
  [
    ...grantApplicationValidations.applicationId,
    ...grantApplicationValidations.reviewNotes,
  ],
  grantApplicationController.addReviewNotes
);

// Upload documents
router.post(
  "/:application_id/documents",
  [
    ...grantApplicationValidations.applicationId,
    ...grantApplicationValidations.documents,
  ],
  grantApplicationController.uploadDocuments
);

module.exports = router;
