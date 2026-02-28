/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const logger = require("firebase-functions/logger");
const mailchimp = require("@mailchimp/mailchimp_marketing");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Initialize Mailchimp
const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX; // e.g., 'us1', 'us2'
const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

if (MAILCHIMP_API_KEY && MAILCHIMP_SERVER_PREFIX) {
  mailchimp.setConfig({
    apiKey: MAILCHIMP_API_KEY,
    server: MAILCHIMP_SERVER_PREFIX,
  });
}

// Sync new newsletter subscribers to Mailchimp
exports.syncNewsletterToMailchimp = onDocumentCreated(
  "newsletter_subscribers/{email}",
  async (event) => {
    const email = event.params.email;
    const subscriberData = event.data.data();

    logger.info(`New newsletter subscriber: ${email}`, subscriberData);

    // Skip if Mailchimp is not configured
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_AUDIENCE_ID) {
      logger.warn("Mailchimp not configured, skipping sync");
      return;
    }

    try {
      // Split name into first and last
      const name = subscriberData.name || "";
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Add or update subscriber in Mailchimp
      await mailchimp.lists.setListMember(
        MAILCHIMP_AUDIENCE_ID,
        email,
        {
          email_address: email,
          status: "subscribed",
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName,
          },
          tags: ["website-signup"],
        }
      );

      logger.info(`Successfully synced ${email} to Mailchimp`);
    } catch (error) {
      logger.error(`Failed to sync ${email} to Mailchimp:`, error);

      // If it's a 404 (not found), try to add them instead
      if (error.status === 404) {
        try {
          const name = subscriberData.name || "";
          const nameParts = name.trim().split(" ");
          const firstName = nameParts[0] || "";
          const lastName = nameParts.slice(1).join(" ") || "";

          await mailchimp.lists.addListMember(MAILCHIMP_AUDIENCE_ID, {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: firstName,
              LNAME: lastName,
            },
            tags: ["website-signup"],
          });

          logger.info(`Successfully added ${email} to Mailchimp`);
        } catch (addError) {
          logger.error(`Failed to add ${email} to Mailchimp:`, addError);
        }
      }
    }
  }
);

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
