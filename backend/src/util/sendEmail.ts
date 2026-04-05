import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import logger from '../config/logger';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASSWORD,
  },
});

export async function sendEmail(to: string | string[], subject: string, htmlBody: string) {
  try {
    const mailOptions = {
      from: process.env.USER_EMAIL,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    logger.error('Error sending email:', error);
    return false;
  }
}
