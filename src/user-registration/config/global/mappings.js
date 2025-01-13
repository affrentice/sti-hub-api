const mongoose = require("mongoose");

const mappings = {
  RANDOM_PASSWORD_CONFIGURATION: function (length) {
    return {
      length: length,
      numbers: true,
      uppercase: true,
      lowercase: true,
      strict: true,
      excludeSimilarCharacters: true,
    };
  },
};
module.exports = mappings;
