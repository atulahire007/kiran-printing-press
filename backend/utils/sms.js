const logger = require('./logger');

exports.sendSMS = async (to, message) => {
  try {
    // Only use Twilio if credentials are set AND package is available
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = require('twilio');
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: `+91${to}`,
        });
        logger.info(`SMS sent to ${to}`);
      } catch (twilioErr) {
        // Twilio not installed or failed — log and continue
        logger.warn(`SMS not sent (Twilio unavailable): ${twilioErr.message}`);
      }
    } else {
      // Development mode — just log the OTP
      logger.info(`[SMS DEV] To: ${to} | Message: ${message}`);
    }
  } catch (error) {
    logger.error(`SMS error: ${error.message}`);
  }
};
