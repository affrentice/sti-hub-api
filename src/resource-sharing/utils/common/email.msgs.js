const constants = require("@config/constants");
const { logObject, logText, logElement, HttpError } = require("@utils/shared");

const processString = (inputString) => {
  const stringWithSpaces = inputString.replace(/[^a-zA-Z0-9]+/g, " ");
  const uppercasedString = stringWithSpaces.toUpperCase();
  return uppercasedString;
};

module.exports = {
  confirm: "Email sent, please check your inbox to confirm",
  confirmed: "Your email is confirmed!",
  resend: "Confirmation email resent, maybe check your spam?",
  couldNotFind: "Could not find you!",
  alreadyConfirmed: "Your email was already confirmed",
  recovery_email: ({ token, email, version }) => {
    let PASSWORD_RESET_URL = constants.PWD_RESET;
    if (version && parseInt(version) === 3) {
      PASSWORD_RESET_URL = `${constants.ANALYTICS_BASE_URL}/account/forgotPwd/reset`;
    }
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    You are receiving this because you (or someone else) have requested the reset of the password for your account.
                                    <br />
                                    <br />
                                    Please click on the following link, or paste this into your browser to complete the process within one hour of receiving
                                    it: ${PASSWORD_RESET_URL}?token=${token}
                                    <br />
                                    <br />
                                    If you did not request this, please ignore this email and your password will remain unchanged.
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content });
  },
  joinRequest: (firstName, lastName, email) => {
    const name = firstName + " " + lastName;
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Your request to join Innovation Hub has been received, we shall get back to you as soon as possible.
                                    <br />
                                    <br />
                                    Before utilising the STI data, your application record has to undergo the process of approval by Innovation Hub
                                    administration.
                                    <br />
                                    Once your application is approved, you will receive a confirmation email<br />
                                    <br />Please visit our website to learn more about us. <a href="https://sti.go.ug/">STI</a>
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  joinEntityRequest: (email, entity_title) => {
    const name = "";
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Your request to access ${processString(
                                      entity_title
                                    )} has been received, we shall get back to you as soon as possible.
                                    <br />
                                    <br />
                                    Before utilising the STI data, your application record has to undergo the process of approval by the respective
                                    administration.
                                    <br />
                                    Once your application is approved, you will receive a confirmation email<br />
                                    <br />Please visit our website to learn more about us. <a href="https://sti.go.ug/">STI</a>
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  inquiry: (fullName, email, category) => {
    let content;
    switch (category) {
      case "policy":
        content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for getting in touch with us and for your interest in our work.
                                    <br />
                                    Kindly let us know how you would like to partner with us and we will get back to you.
                                    <br />
                                    Alternatively, you can get in touch with our Policy Engagement Officer Angela Nshimye at angela@sti.go.ug who will be of
                                    further support.
                                    <br />
                                </td>
                            </tr>`;
        break;
      case "champions":
        content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for choosing to become an STI Innovation Hub champion. 
                                We appreciate your interest and effort in improving your community's health and quality of life. 
                               
                                    <br /><br />
                                 As a first step, we would like to learn more about you so that we can jointly understand how to work together to build a healthier and better community.
                                    <br /><br />
                                    Kindly complete this <a href = "${constants.CHAMPIONS_FORM}">Form</a> to provide your information. 
                                    <br />
                                </td>
                            </tr>`;
        break;
      case "researchers":
        content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for your interest in accessing our Innovation Hub data to further research in Innovation Hub monitoring and
                                management,
                                    <br />
                            You can visit our website at sti.go.ug and navigate to <a href="https://sti.go.ug/explore-data">Explore Data</a> or
                            click <a href="https://sti.go.ug/explore-data">here</a> to access data.
                                    <br />
                                    If you still need further support, please contact our Data Scientists Richard Sserujogi at richard.sserunjogi@sti.go.ug or Wabinyai
                                    Fidel Raja at raja@sti.go.ug for further support.
                                    <br />
                                </td>
                            </tr>`;
        break;
      case "developers":
        content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    <p>Thank you for your interest in our work.</p>
                                    <p>If you are interested in Data Science (ML/AI), please reach out to our Data Science Lead, Richard Sserunjogi, at richard.sserunjogi@sti.go.ug and CC: ds@sti.go.ug.</p>
                                    <p>For inquiries related to Hardware (Embedded Systems) Engineering, accessing the STI API, obtaining STI devices, or setting up an Air Quality Monitoring Network, please contact our Hardware Lead, Joel Ssematimba, at joel@sti.go.ug and CC: network@sti.go.ug.</p>
                                    <p>For open source contributors interested in STI software products, please contact our Software Engineering Lead, Martin Bbaale, at martin@sti.go.ug and CC: platform@sti.go.ug.</p>
                                </td>
                  </tr>`;
        break;
      case "assistance":
        content = `<tr>
                                   <td
                                       style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">  
                                   <p>Thank you for reaching out for assistance. </p>
                                   <p>Please reach out to our Analytics Team Lead Belinda at belindamarion@sti.go.ug for further support. </p>
                                   <p>Thank you for choosing STI.</p>
                                   </td>
                    </tr>`;
        break;
      default:
        content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Thank you for getting in touch with us and for your interest in supporting our work in closing the Innovation Hub data gaps
                                in African Cities. We are happy to foster partnerships to advance Innovation Hub monitoring and management in African
                                Cities.
                                    <br />
                                    <br />
                                    Please get in touch with our project lead Professor Engineer at baino@sti.go.ug or Programme Manager Deo Okure at
                                    dokure@sti.go.ug for further support.
                                    <br />
                                </td>
                            </tr>`;
        break;
    }
    return constants.EMAIL_BODY({ email, content, fullName });
  },
  clientActivationRequest: ({ name = "", email, client_id = "" } = {}) => {
    const content = ` <tr>
    <td
        style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
        <p>Your request to activate your Client ID <strong>${client_id}</strong> has been received, we shall get back to you as soon as possible.</p>
        <p>Before utilising the STI API, your Client ID <strong>${client_id}</strong> has to undergo the process of approval by Innovation Hub
        administration.</p>
        <p>Once your request is approved, you will receive a confirmation email</p>
        <p>Please visit our website to learn more about us. <a href="https://sti.go.ug/">STI</a></p>
    </td>
</tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  yearEndSummary: ({
    username = "",
    email = "",
    engagementTier = "",
    activityDuration = {},
    topServiceDescription = "",
    topServices = [],
    mostUsedEndpoints = [],
  } = {}) => {
    const content = `<tr>
      <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
        
        <p>Congratulations on an amazing year with Innovation Hub! 🎉</p>
        
        ${
          engagementTier ||
          activityDuration.description ||
          topServiceDescription
            ? `
          <div style="margin: 24px 0;">
            <h2 style="color: #344054; font-size: 20px; font-weight: 600; margin-bottom: 16px;">
              🌟 Your 2024 Highlights 🌟
            </h2>
            
            ${
              engagementTier
                ? `<p><strong>Engagement Level:</strong> ${engagementTier}</p>`
                : ""
            }
            ${
              activityDuration.description
                ? `<p><strong>Activity Duration:</strong> ${activityDuration.description}</p>`
                : ""
            }
            
            ${
              topServiceDescription
                ? `<p style="margin-top: 16px;"><strong>Top Service:</strong> ${topServiceDescription}</p>`
                : ""
            }
          </div>`
            : ""
        }
        
        ${
          topServices && topServices.length > 0
            ? `
          <div style="margin: 24px 0;">
            <h3 style="color: #344054; font-size: 18px; font-weight: 600; margin-bottom: 12px;">
              Most Used Services:
            </h3>
            ${topServices
              .slice(0, 3)
              .map(
                (service, index) => `
                  <p style="margin: 8px 0;">
                    ${index + 1}. <strong>${service.service}</strong> (Used ${
                  service.count
                } times)
                  </p>
                `
              )
              .join("")}
          </div>`
            : ""
        }
        
        <p style="margin-top: 24px;">Thank you for being an incredible part of our community!</p>
        
        <p>Best wishes,<br/>The Innovation Hub Team</p>
        
        <p style="margin-top: 24px;">
          Please visit our website to learn more about us. <a href="https://sti.go.ug/" style="color: #0066CC;">STI</a>
        </p>
      </td>
    </tr>`;

    return constants.EMAIL_BODY({ email, content, name: username });
  },
  afterClientActivation: ({ name = "", email, client_id = "" } = {}) => {
    const content = `<tr>
                          <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                              <p>Congratulations! Your Client ID <strong>${client_id}</strong> has been successfully activated.</p>
                              <p>If you have any questions or need assistance with anything, please don't hesitate to reach out to our customer support
                              team. We are here to help. </p>
                              <p>Thank you for choosing Innovation Hub, and we look forward to helping you achieve your goals.</p
                              <p>Sincerely,</p>
                              <p>The STI Data Team </p>
                          </td>
                      </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  afterClientDeactivation: ({ name = "", email, client_id = "" } = {}) => {
    const content = `
    <tr>
         <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
             <p>We are writing to inform you that your STI API client with ID: <strong> ${client_id} </strong> has been successfully deactivated.</p>
             <p>This action means that the client will no longer be able to access the STI API services until it is reactivated.</p>
             <p>If you have any questions or need further assistance, please do not hesitate to contact our support team.</p>
             <p>Thank you for your understanding.</p>
             <p>Best regards,</p>
             <p>The STI Team</p>
       </td>
  </tr>`;

    return constants.EMAIL_BODY({ email, content, name });
  },
  welcome_kcca: (firstName, lastName, password, email) => {
    const name = firstName + " " + lastName;
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                    Welcome to the KCCA STI Innovation Hub monitoring platform.
                                    <br />
                                    Your username is: ${email}
                                    <br />
                                    Your password is: ${password}
                                    <br /><br />
                                    You can always change your password in your account settings after login. Follow this link to access the dashboard right
                                    now: ${constants.LOGIN_PAGE}
                                    <br />
                                    A guide to using Innovation Hub will be found under the Documentation section of Innovation Hub
                                    <br /><br />
                                    PLEASE DO NOT REPLY TO THIS EMAIL. For KCCA related questions, please contact:
                                    <ul>
                                        <li>Sadam Yiga: <span
                                                style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">syiga@kcca.go.ug</span>
                                        </li>
                                        <li>Eleth Nakazzi: <span
                                                style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">enakazzi@kcca.go.ug</span>
                                        </li>
                                    </ul>
                                    <br />
                                    If you experience any technical challenges or wish to offer suggestions, please contact us at
                                    <span
                                        style="color: #135DFF; font-size: 14px; font-family: Inter; font-weight: 400; line-height: 20px; word-wrap: break-word;">support@sti.go.ug</span>
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  welcome_general: (firstName, lastName, password, email) => {
    const name = firstName + " " + lastName;
    const content = `<tr>
                         <td
                             style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                             <p>Welcome to Innovation Hub!! 🎉🎉</p>
                             <p>Your login details are:</p>
                             <ul>
                                 <li>USERNAME: ${email}</li>
                                 <li>PASSWORD: ${password}</li>
                                 <li>Access your dashboard: <a href="${constants.LOGIN_PAGE}">LOGIN</a></li>
                             </ul>
                             <p>Key Documentations:</p>
                             <ul>
                                 <li><a href="https://docs.sti.go.ug/sti-rest-api-documentation/">API Documentation</a></li>
                                 <li><a href="https://docs.sti.go.ug/sti-terms-and-conditions/HxYx3ysdA6k0ng6YJkU3/">STI Terms and Conditions</a></li>
                                 <li><a href="https://docs.sti.go.ug/sti-platform/">User Guide</a></li>
                             </ul>
                             <p>For support, contact us at support@sti.go.ug. This is an automated message. Do not reply</p>
                             <p>Best regards, STI Data Team</p>
                         </td>
                    </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  user_updated: ({
    firstName = "",
    lastName = "",
    updatedUserDetails = {},
    email = "",
  } = {}) => {
    let updatedFields = "<ol>\n";
    Object.keys(updatedUserDetails).forEach((field) => {
      updatedFields += ` <li> ${field}</li>\n`;
    });
    updatedFields += "</ol>";

    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your Innovation Hub account details have been updated.
                                    <br />
                                    The following fields have been updated:
                                    
                                        ${updatedFields}
                                    
                                    <br />
                                    If this activity sounds suspicious to you, please reach out to your organization's administrator.
                                    <br />
                                    Follow this link to access Innovation Hub right now: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    const name = firstName + " " + lastName;

    return constants.EMAIL_BODY({ email, content, name });
  },
  site_activity: ({
    firstName = "",
    lastName = "",
    siteActivityDetails = {},
    email = "",
  } = {}) => {
    let updatedFields = "<ol>\n";
    Object.entries(siteActivityDetails).forEach(([key, value]) => {
      updatedFields += ` <li> ${key}: "${value}"</li>\n`;
    });
    updatedFields += "</ol>";
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                You have just performed an activity on an STI Device or Site.
                                    <br />
                                    The following are the details:
                                   
                                        ${updatedFields}
                                
                                    <br />
                                    If this activity sounds suspicious to you, please reach out to your organization's administrator.
                                    <br />
                                    Follow this link to access Innovation Hub right now: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    const name = firstName + " " + lastName;

    return constants.EMAIL_BODY({ email, content, name });
  },
  field_activity: ({
    firstName = "",
    lastName = "",
    activityDetails = {},
    deviceDetails = {},
    email = "",
    activityType = "recall", // New parameter to determine activity type
  }) => {
    // Create a list of activity details
    let activityDetailsList = Object.entries(activityDetails)
      .map(([key, value]) => `<li>${key}: "${value}"</li>`)
      .join("\n");

    // Create a list of device details
    let deviceDetailsList = Object.entries(deviceDetails)
      .map(([key, value]) => `<li>${key}: "${value}"</li>`)
      .join("\n");

    const actionMessage =
      activityType === "recall"
        ? "A device has been recalled in your STI system."
        : "A device has been deployed in your STI system.";

    const content = `
        <tr>
            <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                ${actionMessage}
                <br />
                <strong>Here are the details:</strong>
                <br />
                <strong>Activity Details:</strong>
                <ol>${activityDetailsList}</ol>
                <strong>Device Details:</strong>
                <ol>${deviceDetailsList}</ol>
                <br />
                If you have any questions or concerns regarding this action, please contact your organization's administrator.
                <br />
                Access Innovation Hub here: ${constants.LOGIN_PAGE}
                <br /><br />
            </td>
        </tr>`;

    const name = `${firstName} ${lastName}`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  token_compromised: ({
    firstName = "",
    lastName = "",
    ip = "",
    email = "",
  } = {}) => {
    const name = firstName + " " + lastName;
    const content = `
    <tr>
      <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
        <p>Suspected unauthorized access detected with your AIRQO API token from <strong>IP address ${ip}</strong>.</p>
        <p>Consider changing your STI Account password. Additionally, whitelist your respective IP address by updating the CLIENT associated with your TOKEN.</p>
        <p>Report any further suspicious activities.</p>
        <p><a href="${constants.LOGIN_PAGE}">Follow this link</a> to access Innovation Hub right now: ${constants.LOGIN_PAGE}</p>
      </td>
    </tr>
   `;

    return constants.EMAIL_BODY({ email, content, name });
  },
  tokenExpired: ({
    firstName = "",
    lastName = "",
    email = "",
    token = "",
  } = {}) => {
    const name = firstName + " " + lastName;
    const content = `
    <tr>
      <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
        <p>Your AIRQO API token <strong>${token}</strong> has expired.</p>
        <p>Please create a new token to continue accessing our services. You can do so by logging into your account and navigating to the API section under settings.</p>
        <p><a href="${constants.LOGIN_PAGE}">Click here</a> to log in to your STI account.</p>
      </td>
    </tr>
    `;

    return constants.EMAIL_BODY({ email, content, name });
  },
  tokenExpiringSoon: ({ firstName = "", lastName = "", email = "" }) => {
    const name = firstName + " " + lastName;
    let content = "";
    content = `
      <tr>
        <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
          <p>Your AIRQO API token is set to expire soon, in less than 1 month from today.</p>
          <p>Please generate a new token to continue accessing our services.</p>
          <p>If you have already done so, please ignore this message.</p>
        </td>
      </tr>
    `;

    return constants.EMAIL_BODY({ email, content, name });
  },
  updateProfilePrompt: ({ firstName = "", lastName = "", email = "" }) => {
    const name = `${firstName} ${lastName}`;
    let content = "";
    content = `
      <tr>
        <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
          <p>We noticed that your first name and last name are not yet set in your profile. Updating these details will enhance your experience with our service.</p>
          <p>To proceed, please visit Innovation Hub and update your profile with your full name.</p>
          <p>If you have already updated your name, please ignore this message.</p>
        </td>
      </tr>
    `;

    return constants.EMAIL_BODY({ email, content, name });
  },
  existing_user: ({ firstName = "", lastName = "", email = "" } = {}) => {
    const name = firstName + " " + lastName;
    const FORGOT_PAGE = `${constants.ANALYTICS_BASE_URL}/account/forgotPwd`;
    const content = `
    <tr>
     <td style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
       <p>You already exist as an STI User.</p>
       <p>Please use the FORGOT PASSWORD feature by clicking <a href="${FORGOT_PAGE}" style="color: blue; text-decoration: underline;">HERE</a>.</p>
     </td>
    </tr>
    `;

    return constants.EMAIL_BODY({ email, content, name });
  },
  user_assigned: (firstName, lastName, assignedTo, email) => {
    const name = firstName + " " + lastName;
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Hello ${name},
                                    <br />
                                    You have been assigned to a new Group or Network: ${assignedTo}.
                                    <br />
                                    Please login to access your new Group or Network.
                                    <br />
                                    If you have any questions or concerns, please feel free to contact your organization's administrator.
                                    <br />
                                    Click here to log in: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;

    return constants.EMAIL_BODY({ email, content, name });
  },
  forgotten_password_updated: (firstName, lastName, email) => {
    const name = firstName + " " + lastName;
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your Innovation Hub account password has been successfully reset.
                                <br />
                                If you did not initiate this password reset, please reach out to your organization's administrator immediately.
                                    <br />
                                    <br />
                                    Follow this link to access <a href="${constants.LOGIN_PAGE}">Innovation Hub right now:</a>
                                    <br />
                                    Or Paste this link into your browser: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  known_password_updated: (firstName, lastName, email) => {
    const name = firstName + " " + lastName;
    const content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                Your Innovation Hub account password has been successfully updated.
                                <br />
                                If you did not initiate this password reset, please reach out to your organization's administrator immediately.
                                    <br />
                                    <br />
                                    Follow this link to access <a href="${constants.LOGIN_PAGE}">Innovation Hub right now:</a>
                                    <br />
                                    Or Paste this link into your browser: ${constants.LOGIN_PAGE}
                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content, name });
  },
  join_by_email: (email, token) => {
    const content = `<tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                To get started with "Knowing Your Air" and Breathing Clean, we need to verify your email address.
                                    <br /><br />
                                    Please Enter the code: ${token}
                                    <br /><br />
                                    That's it! Once verified, you'll gain access to all the app's features. Enjoy tracking your Innovation Hub and making
                                    informed decisions for a healthier life.

                                    <br />
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content });
  },
  authenticate_email: (token, email) => {
    const content = ` <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                You are about to make changes to your email address.
                                <br />
                                <br />
                                First, you need you to re-authenticate.
                                    <br />
                                Enter the code below in the app.
                                <br />
                                The code: ${token}
                                    <br />
                                </td>
                            </tr>`;
    return constants.EMAIL_BODY({ email, content });
  },
  report: (senderEmail, recepientEmail, formart) => {
    const content = `
    <tr>
                                <td
                                    style="color: #344054; font-size: 16px; font-family: Inter; font-weight: 400; line-height: 24px; word-wrap: break-word;">
                                This is an automated notification to inform you that ${senderEmail} has shared an Innovation Hub data report with you.
                                The attached report was generated from our analytics dashboard and provides insights into key Innovation Hub metrics for the specified time period.
                                <br />
                                <br />
                               Report Details:
                               <ul>
                                <li>Format: ${formart}</li>

                               </ul>
                                    <br />
                                    You can access the report under the attachments. If you have any questions or require further clarification regarding
                                    the data presented in the report. Please feel free to reach out to ${senderEmail} directly or contact us.
                                </td>
                            </tr>
  `;
    return constants.EMAIL_BODY({ recepientEmail, content });
  },
};