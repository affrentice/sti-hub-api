const mongoose = require("mongoose");
const prodConfig = {
  DEFAULT_GROUP: process.env.PROD_DEFAULT_GROUP,
  DEFAULT_GROUP_ROLE: process.env.PROD_DEFAULT_GROUP_ROLE,
  MONGO_URI: process.env.MONGO_PROD_URI,
  DB_NAME: process.env.MONGO_PROD,
  PWD_RESET: `${process.env.PLATFORM_PRODUCTION_BASE_URL}/reset`,
  LOGIN_PAGE: `${process.env.PLATFORM_PRODUCTION_BASE_URL}/login`,
  FORGOT_PAGE: `${process.env.PLATFORM_PRODUCTION_BASE_URL}/forgot`,
  PLATFORM_BASE_URL: process.env.PLATFORM_PRODUCTION_BASE_URL,
  ANALYTICS_BASE_URL: "https://analytics.sti.go.ug",
  ENVIRONMENT: "PRODUCTION ENVIRONMENT",
  KAFKA_BOOTSTRAP_SERVERS: process.env.KAFKA_BOOTSTRAP_SERVERS_PROD
    ? process.env.KAFKA_BOOTSTRAP_SERVERS_PROD.split(",").filter(
        (value) => value.trim() !== ""
      )
    : [],
  KAFKA_TOPICS: process.env.KAFKA_TOPICS_PROD,
  SCHEMA_REGISTRY: process.env.SCHEMA_REGISTRY_PROD,
  KAFKA_CLIENT_ID: process.env.KAFKA_CLIENT_ID_PROD,
  KAFKA_CLIENT_GROUP: process.env.KAFKA_CLIENT_GROUP_PROD,
  REDIS_SERVER: process.env.PROD_REDIS_SERVER,
  REDIS_PORT: process.env.PROD_REDIS_PORT,
};
module.exports = prodConfig;
