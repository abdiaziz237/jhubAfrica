const nodemailer = require("nodemailer");
const path = require("path");
const crypto = require("crypto");
// Import the package correctly for CommonJS with ES modules
const nodemailerExpressHandlebars = require("nodemailer-express-handlebars").default;

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'sizumoha458@gmail.com', // jhubafrica Gmail account
    pass: 'zzlw bblw rvql mcju', // App password for jhubafrica
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
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const verificationUrl = `${baseUrl}/api/v1/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: email,
    subject: "Verify Your Email - jhubafrica",
    template: "verify-email", // views/emails/verify-email.hbs
    context: {
      verificationUrl,
      subject: "Verify Your Email - jhubafrica",
      year: new Date().getFullYear(),
      supportUrl: `${baseUrl}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Verification email sent to ${email}`);
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(email, token) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: email,
    subject: "Reset Your Password - jhubafrica",
    template: "reset-password", // views/emails/reset-password.hbs
    context: {
      resetUrl,
      subject: "Reset Your Password - jhubafrica",
      year: new Date().getFullYear(),
      supportUrl: `${baseUrl}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Password reset email sent to ${email}`);
  }
}

/**
 * Send password reset success confirmation email
 */
async function sendPasswordResetSuccessEmail(email) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: email,
    subject: "Password Reset Successful - jhubafrica",
    template: "password-reset-success", // views/emails/password-reset-success.hbs
    context: {
      subject: "Password Reset Successful - jhubafrica",
      year: new Date().getFullYear(),
      supportUrl: `${baseUrl}/support`,
    },
  };

  await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Password reset success email sent to ${email}`);
  }
}

/**
 * Send email with template
 */
async function sendEmail(options) {
  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: options.to,
    subject: options.subject,
    template: options.template,
    context: options.context || {}
  };

  const result = await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Email sent to ${options.to}`);
  }
  return result;
}

/**
 * Send course interest confirmation email
 */
async function sendCourseInterestConfirmation(email, fullName, courseTitle) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: email,
    subject: "Course Interest Confirmation - jhubafrica",
    template: "course-interest-confirmation", // views/emails/course-interest-confirmation.hbs
    context: {
      fullName,
      courseTitle,
      subject: "Course Interest Confirmation - jhubafrica",
      year: new Date().getFullYear(),
      supportUrl: `${baseUrl}/support`,
      coursesUrl: `${baseUrl}/courses`,
    },
  };

  await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Course interest confirmation email sent to ${email}`);
  }
}

/**
 * Send course interest status update email
 */
async function sendCourseInterestStatusUpdate(email, fullName, courseTitle, status, adminResponse) {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5001';
  const mailOptions = {
    from: `"jhubafrica" <sizumoha458@gmail.com>`,
    to: email,
    subject: `Course Interest ${status.charAt(0).toUpperCase() + status.slice(1)} - jhubafrica`,
    template: "course-interest-status", // views/emails/course-interest-status.hbs
    context: {
      fullName,
      courseTitle,
      status,
      adminResponse,
      subject: `Course Interest ${status.charAt(0).toUpperCase() + status.slice(1)} - jhubafrica`,
      year: new Date().getFullYear(),
      supportUrl: `${baseUrl}/support`,
      coursesUrl: `${baseUrl}/courses`,
    },
  };

  await transporter.sendMail(mailOptions);
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📧 Course interest status update email sent to ${email}`);
  }
}

module.exports = {
  transporter,
  generateVerificationToken,
  generatePasswordResetToken,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendPasswordResetSuccessEmail,
  sendEmail,
  sendCourseInterestConfirmation,
  sendCourseInterestStatusUpdate
};