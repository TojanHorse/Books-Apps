import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail email (e.g., example@gmail.com)
    pass: process.env.EMAIL_PASS      // App password (not your Gmail login password)
  }
});

/**
 * Sends a styled anonymous note to a user's email
 * @param {string} recipientEmail - The recipient's email address
 * @param {string} senderID - Anonymous ID of sender
 * @param {string} noteText - The note message content
 */
export const sendNote = async (recipientEmail, senderID, noteText) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Note from Anonymous ID ${senderID}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2C1810;">You've received a note from Anonymous ID ${senderID}</h2>
        <div style="background: #FBF9F7; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="font-size: 16px; line-height: 1.6; color: #5C4F42;">"${noteText}"</p>
        </div>
        <p style="color: #9C8A7A; font-size: 14px;">– Digital Library Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};
