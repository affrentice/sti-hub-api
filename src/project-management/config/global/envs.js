const mongoose = require("mongoose");

const envs = {
  GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  JWT_SECRET: process.env.JWT_SECRET,
  EMAIL: process.env.MAIL_USER,
  DEFAULT_LIMIT: process.env.DEFAULT_LIMIT,
  PORT: process.env.PORT || 3000,
  CLIENT_ORIGIN: process.env.AIRQO_WEBSITE,
  SLACK_TOKEN: process.env.SLACK_TOKEN,
  SLACK_CHANNEL: process.env.SLACK_CHANNEL,
  SLACK_USERNAME: process.env.SLACK_USERNAME,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  UNIQUE_CONSUMER_GROUP: process.env.UNIQUE_CONSUMER_GROUP,
  UNIQUE_PRODUCER_GROUP: process.env.UNIQUE_PRODUCER_GROUP,
  DEFAULT_TENANT: process.env.DEFAULT_TENANT,
  GMAIL_VERIFICATION_FAILURE_REDIRECT:
    process.env.GMAIL_VERIFICATION_FAILURE_REDIRECT,
  GMAIL_VERIFICATION_SUCCESS_REDIRECT:
    process.env.GMAIL_VERIFICATION_SUCCESS_REDIRECT,
  SESSION_SECRET: process.env.SESSION_SECRET,
  DEFAULT_ORGANISATION_PROFILE_PICTURE:
    process.env.DEFAULT_ORGANISATION_PROFILE_PICTURE,
};
module.exports = envs;