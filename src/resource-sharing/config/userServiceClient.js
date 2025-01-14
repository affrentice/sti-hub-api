const axios = require("axios");
const constants = require("@config/constants");
const log4js = require("log4js");
const logger = log4js.getLogger(
  `${constants.ENVIRONMENT} -- user-service-client`
);
const { stringify } = require("@utils/common");

class UserServiceClient {
  constructor() {
    this.baseURL = process.env.USER_SERVICE_URL || "http://user-service:3000";
    this.client = axios.create({
      baseURL: `${this.baseURL}/api/v1/users`,
      timeout: 8000,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.USER_SERVICE_API_KEY,
      },
    });
  }

  async getUsersBulk(userIds, fields = "") {
    try {
      const response = await this.client.post(
        "/admin/bulk/users",
        {
          userIds,
        },
        {
          params: fields ? { fields } : {},
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Bulk fetch failed");
      }

      // Create a map of valid users, filtering out null values
      const usersMap = new Map();
      response.data.data.forEach((user, index) => {
        if (user) {
          usersMap.set(userIds[index], user);
        } else {
          logger.warn(`User not found for ID: ${userIds[index]}`);
        }
      });

      return usersMap;
    } catch (error) {
      logger.error(`Bulk users fetch failed: ${stringify(error)}`);
      throw error;
    }
  }
}
