require('dotenv').config();
const User = require('../models/usermodel');

// ─── Brevo (HTTPS API) email config ──────────────────────────────────────────
// Render free tier blocks outbound SMTP, so we use Brevo's HTTPS API instead.
// Required env vars:
//   BREVO_API_KEY       — xkeysib-... key from Brevo dashboard → SMTP & API → API Keys
//   BREVO_SENDER_EMAIL  — a verified sender email in Brevo
//   BREVO_SENDER_NAME   — (optional) display name, defaults to 'TVS Dealer Support'
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

console.log('[Email Boot] BREVO_API_KEY set?', !!process.env.BREVO_API_KEY,
  'BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL || '(missing)');

async function sendViaBrevo({ to, toName, subject, html }) {
  if (!process.env.BREVO_API_KEY) throw new Error('BREVO_API_KEY env var is not set');
  if (!process.env.BREVO_SENDER_EMAIL) throw new Error('BREVO_SENDER_EMAIL env var is not set');

  const body = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || 'TVS Dealer Support',
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to: [{ email: to, name: toName || to }],
    subject,
    htmlContent: html,
  };

  const res = await fetch(BREVO_API_URL, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Brevo API ${res.status}: ${text}`);
  }
  return text;
}

// ─── Generate Temporary Password ─────────────────────────────────────────────
function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// ─── Send Welcome Email ───────────────────────────────────────────────────────
async function sendWelcomeEmail(user, tempPassword) {
  // Where the user's chat portal lives (separate from agent dashboard)
  const baseUrl = (process.env.USER_CHAT_URL || process.env.DASHBOARD_URL || 'http://localhost:4200').replace(/\/$/, '');
  const loginUrl = baseUrl;
  console.log(`[Email URL DEBUG] USER_CHAT_URL=${process.env.USER_CHAT_URL || '(missing)'} DASHBOARD_URL=${process.env.DASHBOARD_URL || '(missing)'} → using=${baseUrl}`);
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f9; margin: 0; padding: 0; }
          .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #003087, #001f5c); padding: 32px 40px; text-align: center; }
          .header h1 { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px; }
          .header p { color: rgba(255,255,255,0.8); font-size: 13px; margin: 8px 0 0; }
          .body { padding: 36px 40px; color: #334155; }
          .body p { font-size: 15px; line-height: 1.7; margin: 0 0 16px; }
          .creds-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px 24px; margin: 24px 0; }
          .creds-box h3 { margin: 0 0 14px; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
          .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .cred-row:last-child { border-bottom: none; }
          .cred-label { font-size: 13px; color: #64748b; font-weight: 500; }
          .cred-value { font-size: 14px; color: #0f172a; font-weight: 700; font-family: monospace; }
          .btn { display: inline-block; margin: 24px auto 0; background: #003087; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; }
          .btn-wrap { text-align: center; }
          .footer { background: #f8fafc; padding: 24px 40px; text-align: center; border-top: 1px solid #e2e8f0; }
          .footer p { font-size: 12px; color: #94a3b8; margin: 0; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <h1>TVS Dealer Support</h1>
            <p>Your support ticket has been registered.</p>
          </div>
          <div class="body">
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>Thank you for contacting TVS Dealer Support. We have received your request and a dedicated support specialist has been assigned to assist you.</p>
            <p>To continue the conversation and track progress on your ticket, please sign in to your secure support portal using the credentials below.</p>

            <div class="creds-box">
              <h3>Your Sign-in Credentials</h3>
              <div class="cred-row">
                <span class="cred-label">Email</span>
                <span class="cred-value">${user.email}</span>
              </div>
              <div class="cred-row">
                <span class="cred-label">Temporary Password</span>
                <span class="cred-value">${tempPassword}</span>
              </div>
            </div>

            <div class="btn-wrap">
              <a href="${loginUrl}" class="btn">Sign in to Support Portal</a>
            </div>

            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">For your security, this temporary password is intended for first-time access only. We recommend updating it after you sign in.</p>
            <p style="margin-top: 12px; font-size: 13px; color: #64748b;">If you did not request this support ticket, you may safely disregard this email. For any concerns, please reach out to our support team.</p>
          </div>
          <div class="footer">
            <p>This is an automated message from TVS Dealer Support. Please do not reply directly to this email.</p>
            <p style="margin-top: 6px;">© ${new Date().getFullYear()} TVS Motor Company. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendViaBrevo({
    to: user.email,
    toName: user.username,
    subject: 'TVS Dealer Support – Access your support portal',
    html,
  });
}

// ─── Save User & Send Email ───────────────────────────────────────────────────
async function saveUser(userData) {
  const tempPassword = generateTempPassword();

  const user = new User({
    username: userData.username,
    email: userData.email,
    phone: userData.phone,
    userId: userData.userId || null,
    issue: userData.issue,
    status: 'pending',
    tempPassword,
    submittedAt: new Date()
  });

  const savedUser = await user.save();

  // Send email in background (non-blocking) — with 15 sec timeout watchdog
  console.log(`[Email] Attempting to send welcome email to ${savedUser.email}`);
  const sendPromise = sendWelcomeEmail(savedUser, tempPassword);
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Email send timed out after 15s')), 15000)
  );
  Promise.race([sendPromise, timeout])
    .then((info) => {
      console.log(`[Email] ✅ Sent successfully to ${savedUser.email}`, info?.response || '');
    })
    .catch((err) => {
      console.error(`[Email Error] ❌ Failed to send to ${savedUser.email}: ${err.message}`);
      if (err.code) console.error(`[Email Error] code=${err.code}`);
      if (err.response) console.error(`[Email Error] response=${err.response}`);
    });

  return savedUser;
}

function getAllUsers() {
  return User.find().sort({ submittedAt: -1 });
}

function updateUserStatus(id, status) {
  return User.findByIdAndUpdate(id, { status }, { new: true });
}

module.exports = { saveUser, getAllUsers, updateUserStatus };
