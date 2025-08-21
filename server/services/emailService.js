const nodemailer = require('nodemailer');
const { create } = require('express-handlebars');
const path = require('path');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Create Handlebars instance
const hbs = create({
  partialsDir: path.join(__dirname, '../views/emails/partials'),
  layoutsDir: path.join(__dirname, '../views/emails/layouts'),
  defaultLayout: false,
  extname: '.hbs'
});

// Configure transporter to use Handlebars
transporter.use('compile', {
  viewEngine: hbs.engine,
  viewPath: path.join(__dirname, '../views/emails'),
  extName: '.hbs'
});

module.exports = transporter;