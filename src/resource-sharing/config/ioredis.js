const constants = require("./constants");
const {
  mailer,
  stringify,
  date,
  msgs,
  emailTemplates,
  generateFilter,
  winstonLogger,
  responseHandler,
} = require("@utils/common");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");
const Redis = require("ioredis");
const REDIS_SERVER = constants.REDIS_SERVER;
const REDIS_PORT = constants.REDIS_PORT;
logElement("redis URL", REDIS_SERVER && REDIS_SERVER.concat(":", REDIS_PORT));

const ioredis = new Redis({
  port: REDIS_PORT,
  host: REDIS_SERVER,
  showFriendlyErrorStack: true,
});

module.exports = ioredis;
