const express = require("express");
const InquiryController = require("@controllers/inquiry.controller");
const inquiryValidations = require("@validators/inquiry.validators");
const { setJWTAuth, authJWT } = require("@middleware/passport");
const router = express.Router();
// CORS headers middleware
const headers = (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
};
router.use(headers);
router.use(inquiryValidations.pagination(100, 1000));

router.post("/register", inquiryValidations.register, InquiryController.create);
router.get(
  "/",
  inquiryValidations.list,
  setJWTAuth,
  authJWT,
  InquiryController.list
);
router.delete(
  "/",
  inquiryValidations.delete,
  setJWTAuth,
  authJWT,
  InquiryController.delete
);
router.put(
  "/",
  inquiryValidations.update,
  setJWTAuth,
  authJWT,
  InquiryController.update
);
module.exports = router;
