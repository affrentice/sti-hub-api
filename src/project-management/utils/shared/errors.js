const { validationResult } = require("express-validator");

class HttpError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

const convertErrorArrayToObject = (arrays) => {
  const initialValue = {};
  return arrays.reduce((obj, item) => {
    obj[item.param] = item.msg;
    return obj;
  }, initialValue);
};

const extractErrorsFromRequest = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    let allErrors = {};
    errors.errors.forEach((error) => {
      if (error.nestedErrors && Array.isArray(error.nestedErrors)) {
        allErrors = {
          ...allErrors,
          ...convertErrorArrayToObject(error.nestedErrors),
        };
      } else {
        allErrors = { ...allErrors, ...convertErrorArrayToObject([error]) };
      }
    });
    return allErrors;
  }

  return null;
};

module.exports = {
  HttpError,
  extractErrorsFromRequest,
};
