const express = require("express");
const router = express.Router();

router.use("/projects", require("@routes/v1/project.routes"));
router.use("/analytics", require("@routes/v1/analytics.routes"));

module.exports = router;
