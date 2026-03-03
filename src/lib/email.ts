import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_SERVER_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_SERVER_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_SERVER_USER;
  const smtpPass = process.env.SMTP_PASSWORD || process.env.EMAIL_SERVER_PASSWORD;
  const smtpConfigured = smtpHost && smtpUser && smtpPass;

  // In dev mode or when SMTP is not configured, log to console
  const isDev = process.env.NODE_ENV === 'development' || appUrl.includes('localhost');
  if (isDev || !smtpConfigured) {
    console.log('\n======================================================');
    console.log(`[DEV MODE] Password Reset Email`);
    console.log(`To: ${email}`);
    console.log(`Reset Link: ${resetLink}`);
    if (!smtpConfigured) {
      console.log(`(SMTP not configured — email not sent)`);
    }
    console.log('======================================================\n');
    return { resetLink };
  }

  // Production sending
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"LifeLog" <${smtpUser}>`,
    to: email,
    subject: 'Reset your LifeLog Password',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>Hello,</p>
        <p>Someone requested to reset the password for your LifeLog account.</p>
        <p>Click the link below to reset your password. This link is valid for 1 hour.</p>
        <p style="margin: 32px 0;">
          <a href="${resetLink}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this, please safely ignore this email.</p>
      </div>
    `,
  });

  return { resetLink };
}
