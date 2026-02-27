import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const resetLink = `${appUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  if (process.env.NODE_ENV === 'development') {
    console.log('\n======================================================');
    console.log(`[DEV MODE] Simulated Password Reset Email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your LifeLog Password`);
    console.log(`Reset Link: ${resetLink}`);
    console.log('======================================================\n');
    return;
  }

  // Production sending
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || '"LifeLog" <noreply@lifelog.app>',
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
}
