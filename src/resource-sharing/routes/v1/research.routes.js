const express = require("express");
const router = express.Router();
const researchController = require("@controllers/research.controller");
const {
  middlewareUtils,
  ...researchValidations
} = require("@validators/research.validators");

// Apply common middleware
router.use(middlewareUtils.headers);
router.use(middlewareUtils.pagination);

// List research publications (with filtering)
router.get("/", researchValidations.list, researchController.list);

// Create new research publication
router.post(
  "/",
  [
    ...researchValidations.create,
    ...researchValidations.title,
    ...researchValidations.abstract,
    ...researchValidations.keywords,
    ...researchValidations.institution,
    ...researchValidations.researchArea,
    ...researchValidations.documentUrl,
  ],
  researchController.create
);

// Update research publication
router.put(
  "/:publication_id",
  [
    ...researchValidations.update,
    ...researchValidations.title,
    ...researchValidations.abstract,
    ...researchValidations.keywords,
    ...researchValidations.institution,
    ...researchValidations.researchArea,
    ...researchValidations.documentUrl,
  ],
  researchController.update
);

// Get single research publication
router.get(
  "/:publication_id",
  researchValidations.publicationId,
  researchController.get
);

// Delete research publication
router.delete(
  "/:publication_id",
  researchValidations.publicationId,
  researchController.delete
);

// Update publication status
router.patch(
  "/:publication_id/status",
  [...researchValidations.publicationId, ...researchValidations.status],
  researchController.updateStatus
);

// Add citation
router.post(
  "/:publication_id/citations",
  [...researchValidations.publicationId, ...researchValidations.citation],
  researchController.addCitation
);

// Update access level
router.patch(
  "/:publication_id/access",
  [...researchValidations.publicationId, ...researchValidations.accessLevel],
  researchController.updateAccessLevel
);

module.exports = router;
