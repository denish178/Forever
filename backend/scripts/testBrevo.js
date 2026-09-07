import dotenv from "dotenv";

dotenv.config();

const { BREVO_API_KEY, SMTP_USER, SMTP_FROM } = process.env;

if (!BREVO_API_KEY) {
  console.error("Set BREVO_API_KEY in backend/.env (from brevo.com → SMTP & API → API keys)");
  process.exit(1);
}

const senderEmail = (SMTP_FROM || SMTP_USER || "").match(/<([^>]+)>/)?.[1] ||
  (SMTP_FROM || SMTP_USER || "").replace(/[<>]/g, "").trim();

if (!senderEmail) {
  console.error("Set SMTP_FROM or SMTP_USER (verified sender in Brevo)");
  process.exit(1);
}

try {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Forever", email: senderEmail },
      to: [{ email: senderEmail }],
      subject: "Forever — Brevo test",
      textContent: "If you received this, production emails will work on Render.",
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${body}`);
  }

  console.log("Brevo test email sent to", senderEmail);
} catch (error) {
  console.error("Brevo failed:", error.message);
  process.exit(1);
}
