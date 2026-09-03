import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_PASS === "your_gmail_app_password") {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject: "Forever - Password Reset",
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password. Click the button below (valid for 15 minutes):</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;">
          Reset Password
        </a>
      </p>
      <p style="font-size:12px;color:#666;word-break:break-all;">
        If the button does not work, copy and paste this link into your browser:<br />
        ${resetUrl}
      </p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  if (!transporter) {
    console.log("[DEV] SMTP not configured. Password reset link:", resetUrl);
    return;
  }

  await transporter.sendMail(mailOptions);
};
