require('dotenv').config();
const { sendEmail } = require('./services/emailService');

async function testEmailService() {
  try {
    console.log('Testing email service...');
    console.log('Environment variables:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '******' : 'Not set');
    
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      template: 'welcome',
      context: {
        name: 'Test User',
        year: new Date().getFullYear()
      }
    });
    
    console.log('Email sent successfully!');
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

testEmailService();