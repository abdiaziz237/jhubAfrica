const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
// Import the package correctly for CommonJS with ES modules
const nodemailerExpressHandlebars = require("nodemailer-express-handlebars").default;

// Create transporter
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "f966ff1cf28e12", // Mailtrap credentials from test-email.js
    pass: "1d8ae27e2fd311",
  },
});

// Handlebars options
const handlebarOptions = {
  viewEngine: {
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "../views/emails/layouts"),
    defaultLayout: "main", // wraps all templates with main.hbs
    partialsDir: path.join(__dirname, "../views/emails/partials"),
  },
  viewPath: path.join(__dirname, "../views/emails"),
  extName: ".hbs",
};

// Attach handlebars plugin to transporter
transporter.use("compile", nodemailerExpressHandlebars(handlebarOptions));

/**
 * Generate random verification token
 */
function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Generate random password reset token
 */
function generatePasswordResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Send verification email
 */
async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.BASE_URL}/api/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"JHUB Africa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email - JHUB Africa",
    template: "verify-email", // views/emails/verify-email.hbs
    context: {
      verificationUrl,
      subject: "Verify Your Email - JHUB Africa",
      year: new Date().getFullYear(),
      supportUrl: `${process.env.BASE_URL}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Verification email sent to ${email}`);
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, token) {
  const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"JHUB Africa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password - JHUB Africa",
    template: "reset-password", // views/emails/reset-password.hbs
    context: {
      resetUrl,
      subject: "Reset Your Password - JHUB Africa",
      year: new Date().getFullYear(),
      supportUrl: `${process.env.BASE_URL}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Password reset email sent to ${email}`);
}

/**
 * Send password reset success confirmation email
 */
async function sendPasswordResetSuccessEmail(email) {
  const mailOptions = {
    from: `"JHUB Africa" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Successful - JHUB Africa",
    template: "password-reset-success", // views/emails/password-reset-success.hbs
    context: {
      subject: "Password Reset Successful - JHUB Africa",
      year: new Date().getFullYear(),
      supportUrl: `${process.env.BASE_URL}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  console.log(`📧 Password reset success email sent to ${email}`);
}

/**
 * Send email with template
 */
async function sendEmail(options) {
  const mailOptions = {
    from: `"JHUB Africa" <${process.env.EMAIL_USER}>`,
    to: options.to,
    subject: options.subject,
    template: options.template,
    context: options.context || {}
  };

  const result = await transporter.sendMail(mailOptions);
  console.log(`📧 Email sent to ${options.to}`);
  return result;
}

module.exports = {
  transporter,
  generateVerificationToken,
  generatePasswordResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendEmail
};
