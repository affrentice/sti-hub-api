const Redis = require("redis");
const constants = require("./constants");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");
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
const REDIS_SERVER = constants.REDIS_SERVER;
const REDIS_PORT = constants.REDIS_PORT;
logElement("redis URL", REDIS_SERVER && REDIS_SERVER.concat(":", REDIS_PORT));

const redis = Redis.createClient({
  host: REDIS_SERVER,
  port: REDIS_PORT,
  retry_strategy: () => 1000,
});

redis.on("error", (error) => {
  console.error(error);
});

redis.on("ready", () => {
  console.log("Redis connection esablished");
});

module.exports = redis;
