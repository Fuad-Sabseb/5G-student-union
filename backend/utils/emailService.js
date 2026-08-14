const nodemailer = require('nodemailer');

/**
 * Creates Nodemailer transporter based on .env config
 */
const getTransporter = () => {
  const user = process.env.SMTP_EMAIL || process.env.GMAIL_USER;
  const rawPass = process.env.SMTP_PASSWORD || process.env.GMAIL_APP_PASSWORD;
  const pass = rawPass ? rawPass.replace(/\s+/g, '') : '';

  if (user && pass && pass !== 'YOUR_GMAIL_APP_PASSWORD_HERE') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass,
      },
    });
  }

  return null;
};

/**
 * Send 6-digit verification code email
 * @param {string} toEmail - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} language - 'en' or 'or'
 */
const sendVerificationEmail = async (toEmail, code, language = 'or') => {
  const isOromo = language === 'or';
  const subject = isOromo
    ? `Koodii Mirkaneessaa GBSG: ${code}`
    : `Your GBSG Verification Code: ${code}`;

  const htmlContent = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0b1928; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #d9a441;">
      <div style="background: linear-gradient(135deg, #16324f 0%, #0e2238 100%); padding: 24px; text-align: center; border-bottom: 2px solid #d9a441;">
        <h1 style="color: #ffd27d; margin: 0; font-size: 22px; letter-spacing: 0.5px;">Gamtaa Barattoota Shanan Gibee</h1>
        <p style="color: #94a3b8; margin: 6px 0 0; font-size: 13px;">Shanan Gibe Student Union • Jimma University</p>
      </div>

      <div style="padding: 30px 24px; text-align: center;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">
          ${isOromo ? 'Koodii Mirkaneessaa Galmee' : 'Registration Verification Code'}
        </h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5; margin-bottom: 24px;">
          ${
            isOromo
              ? 'Galmee keessan xumuruuf maaloo koodii armaan gadii fayyadamaa. Koodiin kun daqiiqaa 10 qofaan hojjeta.'
              : 'Thank you for joining the Shanan Gibe Student Union. Please use the 6-digit verification code below to complete your registration. This code expires in 10 minutes.'
          }
        </p>

        <div style="background: rgba(217, 164, 65, 0.12); border: 2px dashed #d9a441; border-radius: 10px; padding: 18px; display: inline-block; margin: 0 auto 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #ffd27d; font-family: monospace;">
            ${code}
          </span>
        </div>

        <p style="color: #94a3b8; font-size: 12px; margin: 0;">
          ${
            isOromo
              ? 'Yoo koodii kana hin gaafatin ta\'e, ergaa kana dhiisuu dandeessu.'
              : 'If you did not request this verification code, you can safely ignore this email.'
          }
        </p>
      </div>

      <div style="background-color: #07111b; padding: 14px 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.08);">
        <p style="color: #64748b; font-size: 11px; margin: 0;">
          © ${new Date().getFullYear()} Gamtaa Barattoota Shanan Gibee (GBSG). All rights reserved.
        </p>
      </div>
    </div>
  `;

  const textContent = isOromo
    ? `Koodiin mirkaneessaa galmee keessanii: ${code}. Koodiin kun daqiiqaa 10 qofaaf hojjeta.`
    : `Your GBSG registration verification code is: ${code}. This code expires in 10 minutes.`;

  const transporter = getTransporter();

  if (transporter) {
    try {
      const fromSender = process.env.SMTP_EMAIL || process.env.GMAIL_USER;
      const info = await transporter.sendMail({
        from: `"Gamtaa Barattoota Shanan Gibee" <${fromSender}>`,
        to: toEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });
      console.log(`[Email Service] Sent verification email to ${toEmail} -> MessageID: ${info.messageId}`);
      return { success: true, delivered: true };
    } catch (err) {
      console.error(`[Email Service] Failed to send via SMTP:`, err.message);
      // Fallback: log to console
      console.log(`\n======================================================`);
      console.log(`📬 [DEV OTP CODE for ${toEmail}]: ${code}`);
      console.log(`======================================================\n`);
      return { success: true, delivered: false, error: err.message };
    }
  } else {
    // Development / No SMTP credentials configured yet
    console.log(`\n======================================================`);
    console.log(`📬 [DEV OTP CODE for ${toEmail}]: ${code}`);
    console.log(`⚠️ SMTP credentials not set in .env. Configure SMTP_EMAIL and SMTP_PASSWORD in backend/.env for real Gmail delivery.`);
    console.log(`======================================================\n`);
    return { success: true, delivered: false, isDevMode: true };
  }
};

module.exports = {
  sendVerificationEmail,
};
