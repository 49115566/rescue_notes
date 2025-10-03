import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

// Create transporter with optional auth (for Mailpit in dev, no auth needed)
console.log('[EMAIL] Raw SMTP_PORT from env:', process.env.SMTP_PORT);
const transportConfig: any = {
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 1025,
  secure: process.env.SMTP_SECURE === 'true',
};

// Only add auth if credentials are provided
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transportConfig.auth = {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  };
}

console.log('[EMAIL] Creating transporter with:', transportConfig);
const transporter = nodemailer.createTransport(transportConfig);

export const sendVerificationEmail = async (email: string, code: string): Promise<void> => {
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Rescue Notes'} <${process.env.FROM_EMAIL || 'rescue-notes@localhost'}>`,
    to: email,
    subject: 'Verify Your Email - Rescue Notes',
    html: `
      <h2>Welcome to Rescue Notes!</h2>
      <p>Please verify your email address by entering this 6-digit code:</p>
      <h1 style="color: #4F46E5; font-size: 32px; letter-spacing: 4px; text-align: center; background: #F3F4F6; padding: 20px; border-radius: 8px;">${code}</h1>
      <p>This code will expire in 10 minutes.</p>
      <p>If you didn't create an account with Rescue Notes, please ignore this email.</p>
      <hr>
      <p style="color: #6B7280; font-size: 12px;">
        This is an automated message from Rescue Notes. Please do not reply to this email.
      </p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const sendPasswordResetEmail = async (email: string, resetLink: string): Promise<void> => {
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'Rescue Notes'} <${process.env.FROM_EMAIL || 'rescue-notes@localhost'}>`,
    to: email,
    subject: 'Reset Your Password - Rescue Notes',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password for your Rescue Notes account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
      <hr>
      <p style="color: #6B7280; font-size: 12px;">
        This is an automated message from Rescue Notes. Please do not reply to this email.
      </p>
    `,
  };

  await transporter.sendMail(mailOptions);
};