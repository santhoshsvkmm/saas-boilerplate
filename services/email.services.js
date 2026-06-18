const nodeMailer = require("nodemailer");
require('dotenv').config();
const logger = require("../loggers/logger");

const email={
    smtp: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
    },
    from: process.env.EMAIL_FROM,
  }
  const transport = nodeMailer.createTransport(email.smtp);
  if (process.env !== 'test') {
    transport
      .verify()
      .then(() => logger.info('Connected to email server'))
      .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
  }

 const sendEmail = async (to, subject, html) => {
    const msg = { from: email.from, to, subject, html };
    await transport.sendMail(msg);
};

module.exports = sendEmail;