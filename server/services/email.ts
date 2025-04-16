import nodemailer from 'nodemailer';

// Array of sender emails to rotate between
const SENDER_EMAILS = [
  'skvora1803@gmail.com',
  'aryanbathwar1234@gmail.com'
];

let currentSenderIndex = 0;

// Function to get next sender email (round-robin)
function getNextSender() {
  const sender = SENDER_EMAILS[currentSenderIndex];
  currentSenderIndex = (currentSenderIndex + 1) % SENDER_EMAILS.length;
  return sender;
}

// Create transporter with detailed logging
const transporterConfig = {
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: false,
  logger: false
};

const transporter = nodemailer.createTransport(transporterConfig);

// Test email function
export async function sendTestEmail(toEmail: string) {
  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'Test Email from SmartInstitute',
    text: 'This is a test email to verify the email sending functionality.',
    html: '<h1>Test Email</h1><p>This is a test email to verify the email sending functionality.</p>'
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

// Add test route
export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  // First verify the configuration
  const isConfigValid = await verifyEmailConfig();
  if (!isConfigValid) {
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Reset Your Password - SmartInstitute',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Password Reset Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You have requested to reset your password for your SmartInstitute account. Click the button below to set a new password:</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button" style="color: white;">Reset Password</a>
            </div>
            
            <p><strong>Important:</strong></p>
            <ul>
              <li>This link will expire in 10 minutes</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, please don't share this email with anyone</li>
            </ul>
            
            <p>If the button above doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; font-size: 12px;">${resetLink}</p>
            
            <div class="footer">
              <p>Best regards,<br>SmartInstitute Team</p>
              <p>This is an automated message, please do not reply to this email.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Reset Your Password - SmartInstitute

      Hello,

      You have requested to reset your password for your SmartInstitute account.
      Click the following link to set a new password:

      ${resetLink}

      Important:
      - This link will expire in 10 minutes
      - If you didn't request this reset, please ignore this email
      - For security, please don't share this email with anyone

      Best regards,
      SmartInstitute Team
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    return false;
  }
}

export async function sendVerificationEmail(email: string, verificationLink: string) {
  // First verify the configuration
  const isConfigValid = await verifyEmailConfig();
  if (!isConfigValid) {
    return false;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Verify Your Email - SmartInstitute',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #3b82f6;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
          }
          .content {
            background-color: #f9fafb;
            padding: 20px;
            border-radius: 0 0 5px 5px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #3b82f6;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            color: #6b7280;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email Address</h1>
          </div>
          <div class="content">
            <p>Thank you for registering with SmartInstitute. Please verify your email address to complete your registration.</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>If you did not create an account, you can safely ignore this email.</p>
            <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
            <p style="word-break: break-all; font-size: 14px;">${verificationLink}</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} SmartInstitute. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}