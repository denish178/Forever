import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

if (!SMTP_USER || !SMTP_PASS || SMTP_PASS === "your_gmail_app_password") {
  console.error(
    "SMTP not ready: set SMTP_USER and SMTP_PASS (Gmail app password) in backend/.env",
  );
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST || "smtp.gmail.com",
  port: Number(SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log("SMTP connection OK");

  const info = await transporter.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to: SMTP_USER,
    subject: "Forever — SMTP test",
    text: "If you received this, forgot-password emails will work.",
  });

  console.log("Test email sent to", SMTP_USER);
  console.log("Message ID:", info.messageId);
} catch (error) {
  console.error("SMTP failed:", error.message);
  process.exit(1);
}
