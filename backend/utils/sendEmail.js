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

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();
  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    replyTo: process.env.SMTP_USER,
    subject,
    html,
    text,
    headers: {
      "X-Entity-Ref-ID": `forever-${Date.now()}`,
    },
  };

  if (!transporter) {
    console.log(`[DEV] SMTP not configured. Email skipped: ${subject} -> ${to}`);
    return;
  }

  await transporter.sendMail(mailOptions);
};

const getFrontendUrl = () =>
  (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

const buildOrdersLink = () => `${getFrontendUrl()}/orders`;

const getStatusUpdateMessage = (status) => {
  if (status === "Delivered") {
    return "Your order has been delivered. We hope you enjoy your purchase! If you need help with your order, please contact our support team.";
  }

  return "We'll keep you posted as your order moves along.";
};

const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const buildOrderItemsHtml = (items = []) =>
  items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.size || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity || 1}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${formatCurrency(item.price)}</td>
        </tr>
      `,
    )
    .join("");

const buildAddressHtml = (address = {}) => {
  const lines = [
    `${address.firstName || ""} ${address.lastName || ""}`.trim(),
    address.street,
    [address.city, address.state, address.zipcode].filter(Boolean).join(", "),
    address.country,
    address.phone ? `Phone: ${address.phone}` : "",
  ].filter(Boolean);

  return lines.map((line) => `<p style="margin:0 0 4px;">${line}</p>`).join("");
};

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();

  if (!transporter) {
    console.log("[DEV] SMTP not configured. Password reset link:", resetUrl);
    return;
  }

  await sendMail({
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
  });
};

export const sendOrderConfirmationEmail = async (email, order) => {
  const ordersLink = buildOrdersLink();
  const orderId = String(order._id);
  const status = order.status || "Order Placed";

  const text = `Thank you for your order!

Order ID: ${orderId}
Payment method: ${order.paymentMethod}
Status: ${status}
Total: ${formatCurrency(order.amount)}

View your orders: ${ordersLink}

- Forever`;

  await sendMail({
    to: email,
    subject: `Your Forever order is confirmed (${orderId.slice(-6)})`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;color:#222;max-width:600px;line-height:1.5;">
      <h2 style="margin-bottom:8px;">Thank you for your order</h2>
      <p>Hi, we've received your order and it is being processed.</p>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>Payment method:</strong> ${order.paymentMethod}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.amount)}</p>
      ${order.discount > 0 ? `<p><strong>Coupon:</strong> ${order.couponCode} (-${formatCurrency(order.discount)})</p>` : ""}

      <h3 style="margin-top:24px;">Items</h3>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Product</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Size</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Qty</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #ddd;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${buildOrderItemsHtml(order.items)}
        </tbody>
      </table>

      <h3 style="margin-top:24px;">Delivery Address</h3>
      ${buildAddressHtml(order.address)}

      <p style="margin-top:24px;">
        <a href="${ordersLink}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;">
          View Your Orders
        </a>
      </p>
      <p style="font-size:12px;color:#666;margin-top:16px;word-break:break-all;">
        If the button does not work, open this link:<br />
        <a href="${ordersLink}">${ordersLink}</a>
      </p>
      <p style="font-size:12px;color:#999;margin-top:24px;">Forever — Order notification</p>
      </div>
    `,
  });
};

export const sendOrderStatusEmail = async (email, order, status) => {
  const ordersLink = buildOrdersLink();
  const orderId = String(order._id);
  const statusMessage = getStatusUpdateMessage(status);
  const subject =
    status === "Delivered"
      ? `Your Forever order has been delivered (${orderId.slice(-6)})`
      : `Forever order update: ${status}`;

  const text = `Your order status has been updated.

Order ID: ${orderId}
New status: ${status}
Total: ${formatCurrency(order.amount)}

${statusMessage}

Track your order: ${ordersLink}

- Forever`;

  await sendMail({
    to: email,
    subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;color:#222;max-width:600px;line-height:1.5;">
      <h2 style="margin-bottom:8px;">${status === "Delivered" ? "Your order has been delivered" : "Your order status has been updated"}</h2>
      <p><strong>Order ID:</strong> ${orderId}</p>
      <p><strong>New status:</strong> ${status}</p>
      <p><strong>Total:</strong> ${formatCurrency(order.amount)}</p>
      ${order.discount > 0 ? `<p><strong>Coupon:</strong> ${order.couponCode} (-${formatCurrency(order.discount)})</p>` : ""}
      <p>${statusMessage}</p>
      <p style="margin-top:24px;">
        <a href="${ordersLink}" style="display:inline-block;padding:12px 24px;background:#000;color:#fff;text-decoration:none;border-radius:4px;">
          ${status === "Delivered" ? "View Your Order" : "Track Your Order"}
        </a>
      </p>
      <p style="font-size:12px;color:#666;margin-top:16px;word-break:break-all;">
        If the button does not work, open this link:<br />
        <a href="${ordersLink}">${ordersLink}</a>
      </p>
      <p style="font-size:12px;color:#999;margin-top:24px;">Forever — Order notification</p>
      </div>
    `,
  });
};
