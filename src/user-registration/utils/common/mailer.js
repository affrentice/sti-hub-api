const transporter = require("@config/mailer");
const isEmpty = require("is-empty");
const SubscriptionModel = require("@models/Subscription");
const constants = require("@config/constants");
const msgs = require("./email.msgs");
const msgTemplates = require("./email.templates");
const httpStatus = require("http-status");
const path = require("path");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");
const log4js = require("log4js");
const logger = log4js.getLogger(`${constants.ENVIRONMENT} -- mailer-util`);
const processString = (inputString) => {
  const stringWithSpaces = inputString.replace(/[^a-zA-Z0-9]+/g, " ");
  const uppercasedString = stringWithSpaces.toUpperCase();
  return uppercasedString;
};
const imagePath = path.join(__dirname, "@config/images");
let attachments = [
  {
    filename: "stiLogo.png",
    path: imagePath + "/stiLogo.png",
    cid: "STIEmailLogo",
    contentDisposition: "inline",
  },
  {
    filename: "faceBookLogo.png",
    path: imagePath + "/facebookLogo.png",
    cid: "FacebookLogo",
    contentDisposition: "inline",
  },
  {
    filename: "youtubeLogo.png",
    path: imagePath + "/youtubeLogo.png",
    cid: "YoutubeLogo",
    contentDisposition: "inline",
  },
  {
    filename: "twitterLogo.png",
    path: imagePath + "/Twitter.png",
    cid: "Twitter",
    contentDisposition: "inline",
  },
  {
    filename: "linkedInLogo.png",
    path: imagePath + "/linkedInLogo.png",
    cid: "LinkedInLogo",
    contentDisposition: "inline",
  },
];

const getSubscribedBccEmails = async () => {
  let bccEmails = constants.HARDWARE_AND_DS_EMAILS
    ? constants.HARDWARE_AND_DS_EMAILS.split(",")
    : [];
  let subscribedEmails = [];

  const checkPromises = bccEmails.map(async (bccEmail) => {
    try {
      const checkResult = await SubscriptionModel(
        "sti"
      ).checkNotificationStatus({ email: bccEmail.trim(), type: "email" });
      return checkResult.success ? bccEmail.trim() : null;
    } catch (error) {
      logger.error(
        `Error checking notification status for ${bccEmail}: ${error.message}`
      );
      return null;
    }
  });
  const successfulEmails = (await Promise.all(checkPromises)).filter(
    (email) => email !== null
  );
  subscribedEmails = successfulEmails;
  return subscribedEmails.join(",");
};

const createMailOptions = ({
  email,
  firstName,
  lastName,
  activityDetails,
  deviceDetails,
  bccEmails,
  activityType,
} = {}) => {
  const subject =
    activityType === "recall"
      ? "Innovation Hub: Device Recall Notification"
      : "Innovation Hub: Device Deployment Notification";

  return {
    from: {
      name: constants.EMAIL_NAME,
      address: constants.EMAIL,
    },
    to: email,
    subject,
    html: msgs.field_activity({
      firstName,
      lastName,
      email,
      activityDetails,
      deviceDetails,
      activityType,
    }),
    bcc: bccEmails,
  };
};
const handleMailResponse = (data) => {
  if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
    return { success: true, message: "Email successfully sent", data };
  } else {
    throw new HttpError(
      "Internal Server Error",
      httpStatus.INTERNAL_SERVER_ERROR,
      { message: "Email not sent", emailResults: data }
    );
  }
};
const mailer = {
  candidate: async (
    { firstName, lastName, email, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      let bcc = "";
      if (tenant.toLowerCase() === "sti") {
        bcc = subscribedBccEmails;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub JOIN request",
        html: msgs.joinRequest(firstName, lastName, email),
        bcc,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  request: async (
    { email, targetId, tenant = "sti", entity_title = "" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      let bcc = "";
      if (tenant.toLowerCase() === "sti") {
        bcc = subscribedBccEmails;
      }

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: `Innovation Hub Request to Access ${processString(
          entity_title
        )} Team`,
        html: msgs.joinEntityRequest(email, entity_title),
        bcc,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  yearEndEmail: async ({
    email = "",
    firstName = "",
    lastName = "",
    tenant = "sti",
    userStat = {},
  } = {}) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });

      if (!checkResult.success) {
        return checkResult;
      }

      const mailOptions = {
        to: email,
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        subject: "Your Innovation Hub 2024 Year in Review 🌍",
        html: msgs.yearEndSummary(userStat),
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "Year-end email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        return {
          success: false,
          message: "Internal Server Error",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          errors: { message: "Email not sent", emailResults: data },
        };
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      return {
        success: false,
        message: "Internal Server Error",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        errors: { message: error.message },
      };
    }
  },
  requestToJoinGroupByEmail: async (
    {
      email,
      targetId,
      tenant = "sti",
      entity_title = "",
      inviterEmail = "",
      userExists,
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      let bcc = "";
      if (tenant.toLowerCase() === "sti") {
        bcc = subscribedBccEmails;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: `Innovation Hub Request to Access ${processString(
          entity_title
        )} Team`,
        html: msgTemplates.acceptInvitation({
          email,
          entity_title,
          targetId,
          inviterEmail,
          userExists,
        }),
        bcc,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        // return {
        //   success: false,
        //   message: "Internal Server Error",
        //   status: httpStatus.INTERNAL_SERVER_ERROR,
        //   errors: {
        //     message: "email not sent",
        //     emailResults: data,
        //   },
        // };
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  inquiry: async (
    { fullName, email, category, message, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];
      if (tenant.toLowerCase() === "sti") {
        let bccEmailString = "";
        switch (category) {
          case "partners":
            bccEmailString = constants.PARTNERS_EMAILS;
            break;
          case "policy":
            bccEmailString = constants.POLICY_EMAILS;
            break;
          case "champions":
            bccEmailString = constants.CHAMPIONS_EMAILS;
            break;
          case "researchers":
            bccEmailString = constants.RESEARCHERS_EMAILS;
            break;
          case "developers":
            bccEmailString = constants.DEVELOPERS_EMAILS;
            break;
          case "general":
            bccEmailString = constants.PARTNERS_EMAILS;
            break;
          case "assistance":
            bccEmailString = constants.ASSISTANCE_EMAILS;
            break;
          default:
            bccEmailString = constants.PARTNERS_EMAILS;
        }
        bccEmails = bccEmailString.split(",").map((email) => email.trim());
      }

      // Check notification status for all BCC emails concurrently
      const checkPromises = bccEmails.map(async (bccEmail) => {
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });
        return checkResult.success ? bccEmail : null;
      });
      const successfulEmails = (await Promise.all(checkPromises)).filter(
        (email) => email !== null
      );
      const subscribedBccEmails = successfulEmails.join(",");

      const mailOptionsForSTI = {
        to: `${email}`,
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        subject: `Welcome to STI`,
        html: msgs.inquiry(fullName, email, category),
        bcc: subscribedBccEmails,
        attachments,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptionsForSTI);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  clientActivationRequest: async (
    { name, email, tenant = "sti", client_id } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      const activateClientBccEmails =
        constants.REQUEST_ACCESS_EMAILS || "support@sti.go.ug";
      const bccEmails = activateClientBccEmails
        .split(",")
        .map((email) => email.trim());

      // Check notification status for all BCC emails concurrently
      const checkPromises = bccEmails.map(async (bccEmail) => {
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });
        return checkResult.success ? bccEmail : null;
      });
      const successfulEmails = (await Promise.all(checkPromises)).filter(
        (email) => email !== null
      );
      const subscribedBccEmails = successfulEmails.join(",");

      const mailOptionsForSTI = {
        to: `${email}`,
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        subject: `STI API Client Activation Request`,
        html: msgs.clientActivationRequest({ name, email, client_id }),
        bcc: subscribedBccEmails,
        attachments,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptionsForSTI);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  user: async (
    { firstName, lastName, email, password, tenant = "sti", type } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      let bcc = "";
      if (type === "confirm") {
        bcc = subscribedBccEmails;
      }

      let mailOptions = {};
      if (tenant.toLowerCase() === "kcca") {
        mailOptions = {
          from: {
            name: constants.EMAIL_NAME,
            address: constants.EMAIL,
          },
          to: `${email}`,
          subject: "Welcome to the STI KCCA Platform",
          html: msgs.welcome_kcca(firstName, lastName, password, email),
          bcc,
          attachments,
        };
      } else {
        mailOptions = {
          from: {
            name: constants.EMAIL_NAME,
            address: constants.EMAIL,
          },
          to: `${email}`,
          subject: "Welcome to Innovation Hub",
          html: msgs.welcome_general(firstName, lastName, password, email),
          bcc,
          attachments,
        };
      }

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  verifyEmail: async (
    {
      user_id = "",
      token = "",
      email = "",
      firstName = "",
      category = "",
      tenant = "sti",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      // bcc: subscribedBccEmails,
      const imagePath = path.join(__dirname, "../config/images");

      let mailOptions = {};
      mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Verify your Innovation Hub account",
        html: msgTemplates.v2_emailVerification({
          email,
          firstName,
          user_id,
          token,
          category,
        }),
        attachments: [
          {
            filename: "stiLogo.png",
            path: imagePath + "/stiLogo.png",
            cid: "STIEmailLogo",
            contentDisposition: "inline",
          },
          {
            filename: "faceBookLogo.png",
            path: imagePath + "/facebookLogo.png",
            cid: "FacebookLogo",
            contentDisposition: "inline",
          },
          {
            filename: "youtubeLogo.png",
            path: imagePath + "/youtubeLogo.png",
            cid: "YoutubeLogo",
            contentDisposition: "inline",
          },
          {
            filename: "twitterLogo.png",
            path: imagePath + "/Twitter.png",
            cid: "Twitter",
            contentDisposition: "inline",
          },
          {
            filename: "linkedInLogo.png",
            path: imagePath + "/linkedInLogo.png",
            cid: "LinkedInLogo",
            contentDisposition: "inline",
          },
        ],
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  verifyMobileEmail: async (
    { firebase_uid = "", token = "", email = "", tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const imagePath = path.join(__dirname, "../config/images");

      let mailOptions = {};
      mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Your Login Code for STI Mobile",
        html: msgTemplates.mobileEmailVerification({
          email,
          firebase_uid,
          token,
        }),
        bcc: subscribedBccEmails,
        attachments: [
          {
            filename: "stiLogo.png",
            path: imagePath + "/stiLogo.png",
            cid: "STIEmailLogo",
            contentDisposition: "inline",
          },
          {
            filename: "faceBookLogo.png",
            path: imagePath + "/facebookLogo.png",
            cid: "FacebookLogo",
            contentDisposition: "inline",
          },
          {
            filename: "youtubeLogo.png",
            path: imagePath + "/youtubeLogo.png",
            cid: "YoutubeLogo",
            contentDisposition: "inline",
          },
          {
            filename: "twitterLogo.png",
            path: imagePath + "/Twitter.png",
            cid: "Twitter",
            contentDisposition: "inline",
          },
          {
            filename: "linkedInLogo.png",
            path: imagePath + "/linkedInLogo.png",
            cid: "LinkedInLogo",
            contentDisposition: "inline",
          },
        ],
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  afterEmailVerification: async (
    { firstName = "", username = "", email = "", tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      //bcc: subscribedBccEmails,

      let mailOptions = {};
      mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Welcome to STI!",
        html: msgTemplates.afterEmailVerification(firstName, username, email),
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  afterClientActivation: async (
    {
      name = "",
      email = "",
      tenant = "sti",
      client_id,
      action = "activate",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const subject =
        action === "activate"
          ? "STI API Client Activated!"
          : "STI API Client Deactivated!";
      const htmlContent =
        action === "activate"
          ? msgs.afterClientActivation({ name, email, client_id })
          : msgs.afterClientDeactivation({ name, email, client_id });

      let mailOptions = {};
      mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject,
        html: htmlContent,
        bcc: subscribedBccEmails,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  afterAcceptingInvitation: async (
    { firstName, username, email, entity_title, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      let mailOptions = {};
      mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: `Welcome to ${entity_title}!`,
        html: msgTemplates.afterAcceptingInvitation({
          firstName,
          username,
          email,
          entity_title,
        }),
        bcc: subscribedBccEmails,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  forgot: async ({ email, token, tenant = "sti", version = 2 } = {}, next) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });

      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: email,
        subject: `Link To Reset Password`,
        html: msgs.recovery_email({ token, tenant, email, version }),
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  signInWithEmailLink: async ({ email, token, tenant = "sti" } = {}, next) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const imagePath = path.join(__dirname, "../config/images");
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Verify your email address!",
        html: msgs.join_by_email(email, token),
        attachments: attachments,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  deleteMobileAccountEmail: async (
    { email, token, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Confirm Account Deletion - STI",
        html: msgTemplates.deleteMobileAccountEmail(email, token),
        attachments: attachments,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  authenticateEmail: async ({ email, token, tenant = "sti" } = {}, next) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Changes to your STI email",
        html: `${msgs.authenticate_email(token, email)}`,
        attachments: attachments,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  update: async (
    {
      email = "",
      firstName = "",
      lastName = "",
      updatedUserDetails = {},
      tenant = "sti",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub account updated",
        html: `${msgs.user_updated({
          firstName,
          lastName,
          updatedUserDetails,
          email,
        })}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  assign: async (
    { email, firstName, lastName, assignedTo, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Welcome to Your New Group/Network at Innovation Hub",
        html: `${msgs.user_assigned(firstName, lastName, assignedTo, email)}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  updateForgottenPassword: async (
    { email, firstName, lastName, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub Password Reset Successful",
        html: `${msgs.forgotten_password_updated(firstName, lastName, email)}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  updateKnownPassword: async (
    { email, firstName, lastName, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub Password Update Successful",
        html: `${msgs.known_password_updated(firstName, lastName, email)}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  newMobileAppUser: async (
    { email, message, subject, tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        subject,
        html: message,
        to: email,
        bcc: subscribedBccEmails,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      const response = await transporter.sendMail(mailOptions);

      const data = response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  feedback: async ({ email, message, subject, tenant = "sti" } = {}, next) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.REQUEST_ACCESS_EMAILS) {
        bccEmails = constants.REQUEST_ACCESS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        subject,
        text: message,
        cc: email,
        to: constants.SUPPORT_EMAIL,
        bcc: subscribedBccEmails,
      };

      if (email === "automated-tests@sti.go.ug") {
        return {
          success: true,
          message: "email successfully sent",
          data: [],
          status: httpStatus.OK,
        };
      }

      const response = await transporter.sendMail(mailOptions);

      const data = response;
      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  sendReport: async (
    {
      senderEmail,
      normalizedRecepientEmails,
      pdfFile,
      csvFile,
      tenant = "sti",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email: senderEmail, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }
      let formart;
      let reportAttachments = [...attachments];

      if (pdfFile) {
        formart = "PDF";
        const pdfBase64 = pdfFile.data.toString("base64");
        const pdfAttachment = {
          filename: "Report.pdf",
          contentType: "application/pdf",
          content: pdfBase64,
          encoding: "base64",
        };
        reportAttachments.push(pdfAttachment);
      }
      if (csvFile) {
        formart = "CSV";
        const csvBase64 = csvFile.data.toString("base64");
        const csvAttachment = {
          filename: "Report.csv",
          content: csvBase64,
          encoding: "base64",
        };
        reportAttachments.push(csvAttachment);
      }
      const emailResults = [];

      for (const recepientEmail of normalizedRecepientEmails) {
        if (recepientEmail === "automated-tests@sti.go.ug") {
          return {
            success: true,
            message: "Email successfully sent",
            data: [],
            status: httpStatus.OK,
          };
        }

        const mailOptions = {
          from: {
            name: constants.EMAIL_NAME,
            address: constants.EMAIL,
          },
          subject: "Innovation Hub Report",
          html: msgs.report(senderEmail, recepientEmail, formart),
          to: recepientEmail,
          attachments: reportAttachments,
        };

        const response = await transporter.sendMail(mailOptions);

        if (isEmpty(response.rejected) && !isEmpty(response.accepted)) {
          emailResults.push({
            success: true,
            message: "Email successfully sent",
            data: response,
            status: httpStatus.OK,
          });
        } else {
          emailResults.push({
            success: false,
            message: "Email not sent",
            status: httpStatus.INTERNAL_SERVER_ERROR,
            errors: { message: response },
          });
        }
      }
      const hasFailedEmail = emailResults.some((result) => !result.success);

      if (hasFailedEmail) {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "One or more emails failed to send",
              emailResults,
            }
          )
        );
      } else {
        return {
          success: true,
          message: "All emails successfully sent",
          data: emailResults,
          status: httpStatus.OK,
        };
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
    }
  },
  siteActivity: async (
    {
      email = "",
      firstName = "",
      lastName = "",
      siteActivityDetails = {},
      activityDetails = {},
      deviceDetails = {},
      tenant = "sti",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.HARDWARE_AND_DS_EMAILS) {
        bccEmails = constants.HARDWARE_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub: Monitor Deployment/Recall Alert",
        html: `${msgs.site_activity({
          firstName,
          lastName,
          siteActivityDetails,
          email,
          activityDetails,
          deviceDetails,
        })}`,
        bcc: subscribedBccEmails,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
        return;
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
      return;
    }
  },

  fieldActivity: async ({
    email = "",
    firstName = "",
    lastName = "",
    activityDetails = {},
    deviceDetails = {},
    activityType = "recall", // New parameter to determine activity type
  }) => {
    try {
      const checkResult = await SubscriptionModel(
        "sti"
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) return checkResult;

      const bccEmails = await getSubscribedBccEmails();
      const mailOptions = createMailOptions({
        email,
        firstName,
        lastName,
        activityDetails,
        deviceDetails,
        bccEmails,
        activityType,
      });

      let response = await transporter.sendMail(mailOptions);
      return handleMailResponse(response);
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      throw new HttpError(
        "Internal Server Error",
        httpStatus.INTERNAL_SERVER_ERROR,
        { message: error.message }
      );
    }
  },
  compromisedToken: async (
    { email = "", firstName = "", lastName = "", ip = "", tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      // bcc: subscribedBccEmails,
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject:
          "Urgent Security Alert - Potential Compromise of Your AIRQO API Token",
        html: `${msgs.token_compromised({
          firstName,
          lastName,
          ip,
          email,
        })}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
        return;
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
      return;
    }
  },
  expiredToken: async (
    {
      email = "",
      firstName = "",
      lastName = "",
      tenant = "sti",
      token = "",
    } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      // bcc: subscribedBccEmails,
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Action Required: Your STI API Token is expired",
        html: `${msgs.tokenExpired({
          firstName,
          lastName,
          email,
          token,
        })}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
        return;
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
      return;
    }
  },
  expiringToken: async ({
    email = "",
    firstName = "",
    lastName = "",
    tenant = "sti",
  } = {}) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      // bcc: subscribedBccEmails,
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "STI API Token Expiry: Create New Token Urgently",
        html: `${msgs.tokenExpiringSoon({
          firstName,
          lastName,
          email,
        })}`,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        return {
          success: false,
          message: "Internal Server Error",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          errors: { message: "email not sent", emailResults: data },
        };
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      return {
        success: false,
        message: "Internal Server Error",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        errors: { message: error.message },
      };
    }
  },
  updateProfileReminder: async ({
    email = "",
    firstName = "Unknown",
    lastName = "Unknown",
    tenant = "sti",
  } = {}) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");
      // bcc: subscribedBccEmails,
      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub: Update Your Name to Enhance Your Experience",
        html: `${msgs.updateProfilePrompt({
          firstName,
          lastName,
          email,
        })}`,
        attachments: attachments,
      };

      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        return {
          success: false,
          message: "Internal Server Error",
          status: httpStatus.INTERNAL_SERVER_ERROR,
          errors: { message: "email not sent", emailResults: data },
        };
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      return {
        success: false,
        message: "Internal Server Error",
        status: httpStatus.INTERNAL_SERVER_ERROR,
        errors: { message: error.message },
      };
    }
  },
  existingUserAccessRequest: async (
    { email = "", firstName = "", lastName = "", tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub: Existing User Access Request",
        html: `${msgs.existing_user({
          firstName,
          lastName,
          email,
        })}`,
        bcc: subscribedBccEmails,
        attachments: attachments,
      };
      let response = transporter.sendMail(mailOptions);
      let data = await response;

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
        return;
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
      return;
    }
  },
  existingUserRegistrationRequest: async (
    { email = "", firstName = "", lastName = "", tenant = "sti" } = {},
    next
  ) => {
    try {
      const checkResult = await SubscriptionModel(
        tenant
      ).checkNotificationStatus({ email, type: "email" });
      if (!checkResult.success) {
        return checkResult;
      }

      let bccEmails = [];

      if (constants.PLATFORM_AND_DS_EMAILS) {
        bccEmails = constants.PLATFORM_AND_DS_EMAILS.split(",");
      }

      let subscribedEmails = [];

      for (let i = 0; i < bccEmails.length; i++) {
        const bccEmail = bccEmails[i].trim();
        const checkResult = await SubscriptionModel(
          tenant
        ).checkNotificationStatus({ email: bccEmail, type: "email" });

        if (checkResult.success) {
          subscribedEmails.push(bccEmail);
        }
      }

      const subscribedBccEmails = subscribedEmails.join(",");

      const mailOptions = {
        from: {
          name: constants.EMAIL_NAME,
          address: constants.EMAIL,
        },
        to: `${email}`,
        subject: "Innovation Hub: Existing User Registration Request",
        html: `${msgs.existing_user({
          firstName,
          lastName,
          email,
        })}`,
        bcc: subscribedBccEmails,
        attachments: attachments,
      };
      let data = await transporter.sendMail(mailOptions);

      if (isEmpty(data.rejected) && !isEmpty(data.accepted)) {
        return {
          success: true,
          message: "email successfully sent",
          data,
          status: httpStatus.OK,
        };
      } else {
        next(
          new HttpError(
            "Internal Server Error",
            httpStatus.INTERNAL_SERVER_ERROR,
            {
              message: "email not sent",
              emailResults: data,
            }
          )
        );
        return;
      }
    } catch (error) {
      logger.error(`🐛🐛 Internal Server Error ${error.message}`);
      next(
        new HttpError(
          "Internal Server Error",
          httpStatus.INTERNAL_SERVER_ERROR,
          { message: error.message }
        )
      );
      return;
    }
  },
};

module.exports = mailer;