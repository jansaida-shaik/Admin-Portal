import nodemailer from 'nodemailer';

export const sendEmail = async (to: string, subject: string, html: string) => {
  // If SMTP is not configured, just mock it (so app doesn't crash)
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`[MAILER MOCK] Sending email to: ${to}`);
    console.log(`[MAILER MOCK] Subject: ${subject}`);
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Codegnan Admin Portal" <${process.env.SMTP_FROM_EMAIL || 'no-reply@codegnan.com'}>`,
      to,
      subject,
      html,
    });

    console.log('[MAILER] Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAILER ERROR] Failed to send email:', error);
    return { success: false, error };
  }
};
