const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const isEmpty = require("is-empty");

const strings = {
  CHAMPIONS_FORM: "the form is here",
  ACCOUNT_UPDATED: "The  account has successfully been updated",
  EMAIL_NAME: "The Team",
  TWITTER_ACCOUNT: "https://twitter.com",
};
module.exports = strings;
