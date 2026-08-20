import nodemailer from 'nodemailer';
import { EmailSettings } from '../models/Settings.js';
import { decryptSecret } from '../utils/crypto.js';

/**
 * Build the transporter configuration object and sender info.
 * Prioritizes company-specific/super-admin DB settings if configured with host & credentials,
 * otherwise falls back to environment variables (.env).
 */
export const getTransporterConfig = async (companyId = null) => {
  let settings = null;
  try {
    settings = (await EmailSettings.findOne({ companyId })) || (await EmailSettings.findOne({ companyId: null }));
  } catch {
    // Database might be connecting or unavailable during early startup check
  }

  let fromAddress = process.env.SMTP_FROM_ADDRESS || process.env.SMTP_USER || 'noreply@whatsstore.io';
  let fromName = process.env.SMTP_FROM_NAME || 'WhatsStore SaaS';

  // 1. Prefer database settings if valid host, username, and password exist
  if (settings && settings.host && settings.username && settings.password) {
    try {
      const decryptedPassword = decryptSecret(settings.password);
      if (decryptedPassword && decryptedPassword.trim()) {
        fromAddress = settings.fromAddress || fromAddress;
        fromName = settings.fromName || fromName;
        const port = Number(settings.port) || 587;
        // Port 465 uses direct SSL (secure: true); Port 587 uses STARTTLS (secure: false)
        const isSecure = settings.encryption === 'ssl' || port === 465;

        return {
          transporterConfig: {
            host: settings.host,
            port,
            secure: isSecure,
            auth: {
              user: settings.username,
              pass: decryptedPassword,
            },
            tls: {
              rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
            },
          },
          from: `"${fromName}" <${fromAddress}>`,
          source: 'database',
        };
      }
    } catch {
      // Decryption failed or invalid secret, gracefully fall back to .env
    }
  }

  // 2. Fallback to .env configuration
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = Number(process.env.SMTP_PORT) || 587;
    // Port 587 uses STARTTLS (secure: false); Port 465 uses SSL/TLS (secure: true)
    const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;

    return {
      transporterConfig: {
        host: process.env.SMTP_HOST,
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      },
      from: `"${fromName}" <${fromAddress}>`,
      source: 'env',
    };
  }

  return null;
};

/**
 * Verify SMTP connection at server startup.
 * Logs success or detailed actionable error diagnostics.
 */
export const verifySMTPConnection = async () => {
  try {
    const config = await getTransporterConfig();
    if (!config) {
      console.log('[Mailer Startup] ℹ️  SMTP is not configured in .env or database. Email sending will be inactive.');
      return false;
    }

    const { host, port, secure, auth } = config.transporterConfig;
    const transporter = nodemailer.createTransport(config.transporterConfig);

    await transporter.verify();

    console.log(`=============================================`);
    console.log(`[Mailer] ✅ SMTP Connection verified successfully!`);
    console.log(`  Host:   ${host}:${port} (secure: ${secure})`);
    console.log(`  User:   ${auth.user}`);
    console.log(`  From:   ${config.from}`);
    console.log(`  Source: ${config.source}`);
    console.log(`=============================================`);
    return true;
  } catch (error) {
    console.error(`=============================================`);
    console.error(`[Mailer Startup Error] ❌ SMTP verification failed:`);
    console.error(`  Error Message: ${error.message}`);
    if (error.code) console.error(`  Error Code:    ${error.code}`);
    if (error.responseCode) console.error(`  Response Code: ${error.responseCode}`);
    if (error.response) console.error(`  SMTP Response: ${error.response}`);
    if (error.command) console.error(`  SMTP Command:  ${error.command}`);

    if (error.responseCode === 535 || /invalid credentials|535/i.test(error.message)) {
      console.error(`---------------------------------------------`);
      console.error(`[Mailer Diagnostic: Gmail 535 Authentication Fix]`);
      console.error(`  1. Make sure 2-Step Verification is enabled on your Google Account.`);
      console.error(`  2. Generate a 16-character App Password at: https://myaccount.google.com/apppasswords`);
      console.error(`  3. Paste the 16-character App Password into SMTP_PASS (WITHOUT any spaces).`);
      console.error(`  4. Do NOT use your regular Gmail password.`);
      console.error(`  5. If you see "Too many failed login attempts", wait 15-30 mins for Google rate-limit to clear.`);
      console.error(`---------------------------------------------`);
    }
    console.error(`=============================================`);
    return false;
  }
};

/**
 * Send an email using Nodemailer.
 */
export const sendEmail = async ({ to, subject, html, text, companyId = null }) => {
  try {
    const config = await getTransporterConfig(companyId);
    if (!config) {
      console.warn(`[Mailer] Cannot send email to ${to}: SMTP is not configured in .env or database.`);
      return { success: false, error: 'SMTP is not configured. Add valid SMTP settings in .env or Super Admin > Settings > Email (SMTP).' };
    }

    const transporter = nodemailer.createTransport(config.transporterConfig);
    const info = await transporter.sendMail({
      from: config.from,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      html,
    });

    console.log(`[Mailer] ✉️  Email dispatched to ${to} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Mailer Error] Failed to send email to ${to}:`);
    console.error(`  Message:       ${error.message}`);
    if (error.code) console.error(`  Code:          ${error.code}`);
    if (error.responseCode) console.error(`  Response Code: ${error.responseCode}`);
    if (error.response) console.error(`  SMTP Response: ${error.response}`);
    if (error.command) console.error(`  Command:       ${error.command}`);

    if (error.responseCode === 535 || /authentication failed|invalid login|535/i.test(error.message)) {
      return {
        success: false,
        error: `SMTP authentication failed (535: Invalid credentials). Ensure you are using a 16-character Google App Password (without spaces) and not your personal Gmail password.`,
        details: error.response || error.message,
      };
    }
    return { success: false, error: error.message, details: error.response || null };
  }
};
