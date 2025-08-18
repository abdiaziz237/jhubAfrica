require('dotenv').config();
const { sendEmail } = require('./services/emailService');

(async () => {
  console.log('🚀 Comprehensive JHub Email Test\n');

  const testEmail = {
    to: 'test@example.com', // Will only appear in Mailtrap
    subject: 'JHub System Test',
    template: 'welcome',
    context: {
      name: 'Test User',
      appName: 'JHub Platform',
      loginUrl: 'http://localhost:3000/login'
    }
  };

  try {
    console.log('Sending test email with these parameters:');
    console.log(`To: ${testEmail.to}`);
    console.log(`Subject: ${testEmail.subject}`);
    console.log(`Template: ${testEmail.template}.hbs\n`);

    const result = await sendEmail(testEmail);
    
    console.log('✅ TEST SUCCESSFUL');
    console.log('├── Email accepted by Mailtrap');
    console.log(`├── Message ID: ${result.messageId}`);
    console.log('└── View in Mailtrap: https://mailtrap.io/inboxes\n');
    console.log('Next steps:');
    console.log('1. Open Mailtrap in your browser');
    console.log('2. Check your Demo Inbox');
    console.log('3. Verify email content and formatting');
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error(`Error: ${error.message}\n`);
    
    console.log('🛠️  TROUBLESHOOTING GUIDE');
    console.log('1. Credentials Check');
    console.log('   - Verify in emailService.js or .env file');
    console.log('   - Username: f966ff1cf28e12');
    console.log('   - Password: 1d8ae27e2fd311');
    console.log('2. Template Verification');
    console.log('   - File must exist: views/emails/welcome.hbs');
    console.log('   - Run: ls views/emails/ to confirm');
    console.log('3. Network Test');
    console.log('   - Try: telnet sandbox.smtp.mailtrap.io 2525');
    console.log('   - Should respond "220 Mailtrap SMTP ready"');
    console.log('4. Mailtrap Status');
    console.log('   - Ensure account is active at mailtrap.io');
    console.log('   - Check inbox quota not exceeded\n');
    console.log('For immediate help:');
    console.log('- Visit Mailtrap SMTP docs: https://mailtrap.io/blog/nodejs-send-email/');
  }
})();

