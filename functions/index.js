import functions from "firebase-functions";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";
import CryptoJS from "crypto-js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

// ---- Config from Firebase Functions runtime config ----
//   firebase functions:config:set sg.key="SG.xxxx" sg.sender="no-reply@yallafinder.com" sg.replyto="support@yallafinder.com" app.name="YallaFinder"
const SENDGRID_KEY = process.env.SENDGRID_KEY || functions.config().sg?.key;
const SENDER = process.env.SENDER || functions.config().sg?.sender || "no-reply@yallafinder.com";
const REPLYTO = process.env.REPLYTO || functions.config().sg?.replyto || "support@yallafinder.com";
const APP_NAME = process.env.APP_NAME || functions.config().app?.name || "YallaFinder";

if (!SENDGRID_KEY) {
  console.warn('WARNING: No SendGrid key found. Set with: firebase functions:config:set sg.key="..."');
} else {
  sgMail.setApiKey(SENDGRID_KEY);
}

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// ------------------------------------------------------------------
// Email template (responsive, Outlook-safe, with dark mode tweaks)
// ------------------------------------------------------------------
const otpEmailHtml = ({
  appName,
  code,             // "123456"
  minutes = 10,
  logoUrl = "https://yallafinder.com/logo.png", 
  brand = "#2563eb",
  support = REPLYTO,
}) => `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${appName} Verification Code</title>
  <style>
    .btn { background:${brand}; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px; display:inline-block; font-weight:600; }
    @media (prefers-color-scheme: dark) {
      body { background:#0b1220 !important; }
      .card { background:#111827 !important; color:#e5e7eb !important; }
      .muted { color:#9ca3af !important; }
      .code { background:#0b1220 !important; color:#e5e7eb !important; border-color:#374151 !important; }
    }
  </style>
</head>
<body style="margin:0;background:#f3f4f6;font-family:Inter,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <!-- preheader (hidden preview text) -->
  <span style="display:none !important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
    Your ${appName} code is ${code}. It expires in ${minutes} minutes.
  </span>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
          <tr>
            <td style="text-align:center;padding-bottom:18px;">
              ${logoUrl
                ? `<img src="${logoUrl}" alt="${appName}" height="36" style="display:inline-block;border:0;outline:none;">`
                : `<div style="font-weight:800;font-size:20px;color:${brand}">${appName}</div>`}
            </td>
          </tr>

          <tr>
            <td class="card" style="background:#ffffff;border-radius:14px;padding:32px;box-shadow:0 8px 20px rgba(0,0,0,0.06);">
              <h1 style="margin:0 0 6px;font-size:20px;line-height:1.4;color:#111827;text-align:center;">Here is your One-Time Password</h1>
              <p class="muted" style="margin:0 0 22px;color:#6b7280;font-size:14px;text-align:center;">to verify your email for <strong>${appName}</strong></p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:6px 0 16px;">
                    <div class="code" style="display:inline-block;font-size:32px;letter-spacing:6px;font-weight:700;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:16px 22px;color:#111827;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;">
                      ${code}
                    </div>
                  </td>
                </tr>
              </table>

              <p class="muted" style="margin:0 0 6px;text-align:center;color:#6b7280;font-size:12px;">
                Valid for <strong>${minutes} minutes</strong>. Do not share this code with anyone.
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />

              <p class="muted" style="margin:0;color:#6b7280;font-size:12px;text-align:center;">
                Didn’t request this? You can safely ignore this email, or contact
                <a href="mailto:${support}" style="color:${brand};text-decoration:none;">${support}</a>.
              </p>
            </td>
          </tr>

          <tr>
            <td style="text-align:center;padding-top:16px;color:#9ca3af;font-size:12px;">
              © ${new Date().getFullYear()} ${appName}. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// --- helpers ---
const hashCode = (code) => CryptoJS.SHA256(code).toString();
const expiresAt = (mins) =>
  admin.firestore.Timestamp.fromDate(new Date(Date.now() + mins * 60000));

async function sendEmailOTP(to, code) {
  const html = otpEmailHtml({
    appName: APP_NAME,
    code,
    minutes: 10,
    // swap this to your actual hosted logo or remove to use text brand
    logoUrl: "https://yallafinder.com/logo.png",
    support: REPLYTO,
    brand: "#2563eb",
  });

  const msg = {
    to,
    from: { email: SENDER, name: APP_NAME },
    replyTo: REPLYTO,
    subject: `${APP_NAME} verification code: ${code}`,
    // Keep a plain-text version for deliverability and accessibility
    text: `Your ${APP_NAME} code is ${code}. It expires in 10 minutes. If you didn’t request it, ignore this email.`,
    html,
  };

  try {
    const [res] = await sgMail.send(msg);
    return { ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode };
  } catch (e) {
    const status = e?.code || e?.response?.statusCode || 500;
    const details = e?.response?.body?.errors?.map((x) => x.message).join("; ") || e?.message;
    const overQuota = status === 429 || /limit|exceed|quota|credit/i.test(details || "");
    return { ok: false, status, overQuota, details };
  }
}

// --- rate limits ---
const limiterSend = new RateLimiterMemory({ points: 3, duration: 300 });   // 3 sends per 5 min per email
const limiterVerify = new RateLimiterMemory({ points: 10, duration: 300 }); // 10 verify attempts per 5 min

/**
 * POST /email/send
 * body: { email: "user@example.com" }
 */
app.post("/email/send", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ ok: false, error: "Invalid email" });
    }
    await limiterSend.consume(email);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = hashCode(code);

    await db.collection("email_otps").doc(email).set({
      codeHash,
      attempts: 0,
      expiresAt: expiresAt(10), // 10-minute TTL
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const r = await sendEmailOTP(email, code);
    if (!r.ok) {
      if (r.overQuota) {
        return res.status(429).json({ ok: false, error: "Email send limit reached. Please try again later." });
      }
      console.error("SendGrid error:", r.status, r.details);
      return res.status(502).json({ ok: false, error: "Email send failed" });
    }
    return res.json({ ok: true });
  } catch (e) {
    if (e.remainingPoints !== undefined) {
      return res.status(429).json({ ok: false, error: "Too many requests" });
    }
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

/**
 * POST /email/verify
 * body: { email: "user@example.com", code: "123456" }
 * On success: returns { ok: true, customToken }
 */
app.post("/email/verify", async (req, res) => {
  try {
    const { email, code } = req.body || {};
    if (!email || !/^\S+@\S+\.\S+$/.test(email) || !/^\d{6}$/.test(code)) {
      return res.status(400).json({ ok: false, error: "Invalid input" });
    }
    await limiterVerify.consume(email);

    const ref = db.collection("email_otps").doc(email);
    const snap = await ref.get();
    if (!snap.exists) return res.status(400).json({ ok: false, error: "No code. Send again." });

    const { codeHash, attempts = 0, expiresAt: exp } = snap.data();
    const now = admin.firestore.Timestamp.now();
    if (exp && now.toMillis() > exp.toMillis()) {
      await ref.delete();
      return res.status(400).json({ ok: false, error: "Code expired" });
    }
    if (attempts >= 5) {
      await ref.delete();
      return res.status(400).json({ ok: false, error: "Too many attempts" });
    }

    if (hashCode(code) !== codeHash) {
      await ref.update({ attempts: attempts + 1 });
      return res.status(400).json({ ok: false, error: "Incorrect code" });
    }

    // Create/fetch user, mark emailVerified, mint custom token
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
    } catch {
      user = await admin.auth().createUser({ email, emailVerified: true });
    }
    if (!user.emailVerified) {
      await admin.auth().updateUser(user.uid, { emailVerified: true });
    }
    const customToken = await admin.auth().createCustomToken(user.uid);

    await ref.delete(); // cleanup
    return res.json({ ok: true, customToken });
  } catch (e) {
    if (e.remainingPoints !== undefined) {
      return res.status(429).json({ ok: false, error: "Too many requests" });
    }
    console.error(e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export const api = functions.https.onRequest(app);
