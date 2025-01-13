const express = require("express");
const router = express.Router();
const createChecklistController = require("@controllers/checklist.controller");
const {
  create,
  update,
  list,
  delete: deleteValidations,
} = require("@validators/checklist.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");
// Apply authentication middleware where needed
const authMiddleware = [setJWTAuth, authJWT];
// Routes with grouped validations
router.post("/upsert", create, createChecklistController.upsert);
router.put("/:user_id", update, createChecklistController.update);
router.post("/", create, createChecklistController.create);
router.get("/", list, createChecklistController.list);
router.delete(
  "/:user_id",
  [...deleteValidations, ...authMiddleware],
  createChecklistController.delete
);
router.get("/:user_id", list, createChecklistController.list);
module.exports = router;
