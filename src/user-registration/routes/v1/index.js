const express = require("express");
const router = express.Router();

router.use("/permissions", require("@routes/v1/permission.routes"));
router.use("/roles", require("@routes/v1/role.routes"));
router.use("/inquiries", require("@routes/v1/inquiry.routes"));
router.use("/requests", require("@routes/v1/request.routes"));
router.use("/checklist", require("@routes/v1/checklist.routes"));
router.use("/maintenances", require("@routes/v1/maintenance.routes"));
router.use("/tokens", require("@routes/v1/token.routes"));
router.use("/clients", require("@routes/v1/client.routes"));
router.use("/scopes", require("@routes/v1/scope.routes"));
router.use("/departments", require("@routes/v1/department.routes"));
router.use("/groups", require("@routes/v1/group.routes"));
router.use("/", require("@routes/v1/user.routes"));
router.use("/directories", require("@routes/v1/directory.routes"));
router.use("/profiles", require("@routes/v1/profile.routes"));

module.exports = router;
