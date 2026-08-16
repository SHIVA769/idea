import nodemailer from 'nodemailer';
import { EmailSettings } from '../models/Settings.js';
import { decryptSecret } from '../utils/crypto.js';

export const sendEmail = async ({ to, subject, html, text, companyId = null }) => {
  try {
    // 1. Fetch SMTP settings for company or platform
    const settings = await EmailSettings.findOne({ companyId });

    let transporter;
    let fromAddress = 'noreply@whatsstore.io';
    let fromName = 'WhatsStore SaaS';

    if (settings && settings.host && settings.username) {
      const decryptedPassword = decryptSecret(settings.password);
      fromAddress = settings.fromAddress || fromAddress;
      fromName = settings.fromName || fromName;

      transporter = nodemailer.createTransport({
        host: settings.host,
        port: settings.port || 587,
        secure: settings.encryption === 'ssl',
        auth: {
          user: settings.username,
          pass: decryptedPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    } else {
      // In-memory ethereal / test transporter if SMTP is not configured yet
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: Number(process.env.SMTP_PORT) || 587,
        auth: {
          user: process.env.SMTP_USER || 'demo@ethereal.email',
          pass: process.env.SMTP_PASS || 'demopass',
        },
      });
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to,
      subject,
      text: text || html.replace(/<[^>]+>/g, ''),
      html,
    });

    console.log(`[Mailer] Email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[Mailer Error]', error.message);
    // Don't crash app if SMTP fails, return error info
    return { success: false, error: error.message };
  }
};
