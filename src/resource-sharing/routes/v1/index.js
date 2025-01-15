const express = require("express");
const router = express.Router();

router.use(
  "/grant-applications",
  require("@routes/v1/grant.application.routes")
);
router.use("/grants", require("@routes/v1/grant.routes"));
router.use("/research-publications", require("@routes/v1/research.routes"));

module.exports = router;
