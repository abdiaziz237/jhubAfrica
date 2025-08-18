const nodemailer = require('nodemailer');
const path = require('path');
const hbs = require('nodemailer-express-handlebars');

// Configure transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "sandbox.smtp.mailtrap.io",
    port: process.env.EMAIL_PORT || 2525,
    auth: {
      user: process.env.EMAIL_USER || "f966ff1cf28e12",
      pass: process.env.EMAIL_PASS || "1d8ae27e2fd311"
    }
  });
};

// Initialize email service
const transporter = createTransporter();

// Configure templates
transporter.use('compile', hbs({
  viewEngine: {
    extname: '.hbs',
    partialsDir: path.resolve('./views/emails'),
    defaultLayout: false,
  },
  viewPath: path.resolve('./views/emails'),
  extName: '.hbs',
}));

// Email sending with full logging
const sendEmail = async (mailOptions) => {
  const defaultOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'JHub Admin'}" <${process.env.EMAIL_FROM_ADDRESS || 'no-reply@jhub.test'}>`
  };

  try {
    const info = await transporter.sendMail({
      ...defaultOptions,
      ...mailOptions
    });

    console.log(`
    🚀 Email successfully sent
    ├── To: ${info.envelope.to}
    ├── Subject: ${info.envelope.subject}
    └── View in Mailtrap: https://mailtrap.io/inboxes
    `);
    
    return info;
  } catch (error) {
    console.error(`
    ❌ Email failed to send
    ├── Error: ${error.message}
    └── Troubleshooting:
        ${error.response ? `SMTP Code: ${error.responseCode}\n        Message: ${error.response}` : 'Check your network connection'}
    `);
    throw error;
  }
};

module.exports = { sendEmail };