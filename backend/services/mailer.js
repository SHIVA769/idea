import nodemailer from 'nodemailer';
import { EmailSettings } from '../models/Settings.js';
import { decryptSecret } from '../utils/crypto.js';

export const sendEmail = async ({ to, subject, html, text, companyId = null }) => {
  try {
    // Prefer company SMTP settings, then use the platform SMTP settings.
    const settings = await EmailSettings.findOne({ companyId }) || await EmailSettings.findOne({ companyId: null });

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
    } else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      return { success: false, error: 'SMTP is not configured. Add valid SMTP settings in Super Admin > Settings > Email (SMTP).' };
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
    if (error.responseCode === 535 || /authentication failed|invalid login/i.test(error.message)) {
      return { success: false, error: 'SMTP authentication failed. Check the SMTP username and password. Gmail requires an App Password, not the normal account password.' };
    }
    // Don't crash app if SMTP fails, return error info
    return { success: false, error: error.message };
  }
};
