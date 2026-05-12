// utils/sms.js
const logger = require('./logger');

exports.sendSMS = async (to, message) => {
  try {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
      await client.messages.create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: `+91${to}` });
    } else {
      // Development: just log
      logger.info(`[SMS DEV] To: ${to} | Message: ${message}`);
    }
  } catch (error) {
    logger.error(`SMS send failed: ${error.message}`);
  }
};
