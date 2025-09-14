import * as functions from "firebase-functions/v1";
import admin from "firebase-admin";
import express from "express";
import cors from "cors";
import CryptoJS from "crypto-js";
import { RateLimiterMemory } from "rate-limiter-flexible";
import sgMail from "@sendgrid/mail";

admin.initializeApp();
const db = admin.firestore();

// ---- Config (firebase functions:config:set ...) ----
const SENDGRID_KEY = process.env.SENDGRID_KEY || functions.config().sg?.key;
const SENDER     = process.env.SENDER   || functions.config().sg?.sender  || "no-reply@yallafinder.com";
const REPLYTO    = process.env.REPLYTO  || functions.config().sg?.replyto || "support@yallafinder.com";
const APP_NAME   = process.env.APP_NAME || functions.config().app?.name   || "YallaFinder";

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
  // light mode = blue; dark mode = white
  logoLightUrl = "https://yallafinder.com/assets/yallafinder_icon_96_blue.png",
  logoDarkUrl  = "https://yallafinder.com/assets/yallafinder_icon_96.png",
  brand = "#2563eb",
  support = REPLYTO,
}) => `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <title>${appName} Verification Code</title>
  <style>
    /* Bigger logo and ensure single-logo behavior */
    .logo-wrap { text-align:center; padding-bottom:18px; line-height:0; }
    .logo { display:block; height:48px; width:auto; margin:0 auto; border:0; outline:none; }
    /* Default = light mode → show blue */
    .logo-light { display:block; }
    .logo-dark  { display:none;  }
    /* Improve Outlook behavior if both ever render */
    .logo-dark { mso-hide:all; }

    .btn { background:${brand}; color:#fff; text-decoration:none; padding:12px 18px; border-radius:8px; display:inline-block; font-weight:600; }

    @media (prefers-color-scheme: dark) {
      body  { background:#0b1220 !important; }
      .card { background:#111827 !important; color:#e5e7eb !important; }
      .muted{ color:#9ca3af !important; }
      .code { background:#0b1220 !important; color:#e5e7eb !important; border-color:#374151 !important; }

      /* Dark mode → hide blue, show white */
      .logo-light { display:none !important; }
      .logo-dark  { display:block !important; }
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
            <td class="logo-wrap">
              <!-- Light-mode blue logo -->
              <img class="logo logo-light" src="${logoLightUrl}" alt="">
              <!-- Dark-mode white logo -->
              <img class="logo logo-dark"  src="${logoDarkUrl}"  alt="">
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
    logoLightUrl: "https://yallafinder.com/assets/yallafinder_icon_96_blue.png", // blue for light
    logoDarkUrl:  "https://yallafinder.com/assets/yallafinder_icon_96.png",      // white for dark
    support: REPLYTO,
    brand: "#2563eb",
  });

  const msg = {
    to,
    from: { email: SENDER, name: APP_NAME },
    replyTo: REPLYTO,
    subject: `${APP_NAME} verification code: ${code}`,
    text: `Your ${APP_NAME} code is ${code}. It expires in 10 minutes. If you didn't request it, ignore this email.`,
    html,
  };

  const [res] = await sgMail.send(msg);
  return { ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode };
}


// --- rate limits ---
const limiterSend = new RateLimiterMemory({ points: 5, duration: 300 });   // 3 sends per 5 min per email
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

const limiterContact = new RateLimiterMemory({ points: 5, duration: 300 });

app.post("/contact/send", async (req, res) => {
  try {
    const { name = "", email = "", phone = "", message = "", website = "" } = req.body || {};

    // Honeypot check
    if (website && typeof website === "string" && website.trim().length > 0) {
      res.status(200).json({ ok: true }); // pretend success for bots
      return;
    }

    // Basic validation
    if (!/^\S+@\S+\.\S+$/.test(email) || String(name).trim().length < 2 || String(message).trim().length < 5) {
      res.status(400).json({ ok: false, error: "Invalid input" });
      return;
    }

    // rate limit by email
    await limiterContact.consume(email.toLowerCase());

    // Email support@yallafinder.com
    const to = "support@yallafinder.com";
    const safe = (s) => String(s ?? "").toString().slice(0, 4000);

    const html = `
      <div style="font-family:Inter,Segoe UI,system-ui,sans-serif;font-size:14px;color:#111">
        <h2 style="margin:0 0 8px">${APP_NAME} — New Contact Message</h2>
        <p><strong>Name:</strong> ${safe(name)}</p>
        <p><strong>Email:</strong> ${safe(email)}</p>
        <p><strong>Phone:</strong> ${safe(phone)}</p>
        <p style="margin-top:12px"><strong>Message:</strong><br/>${safe(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `;

    if (!SENDGRID_KEY) {
      console.warn("No SENDGRID_KEY set; skipping email send for contact form");
      res.status(200).json({ ok: true, note: "email skipped (no key)" });
      return;
    }

    await sgMail.send({
      to,
      from: { email: SENDER, name: APP_NAME },
      replyTo: email, // so you can reply directly
      subject: `[${APP_NAME}] Contact: ${safe(name)}`,
      html,
    });

    res.json({ ok: true });
  } catch (e) {
    if (e && typeof e === "object" && "remainingPoints" in e) {
      res.status(429).json({ ok: false, error: "Too many requests" });
      return;
    }
    console.error(e);
    res.status(500).json({ ok: false, error: "Server error" });
  }
});

// --- Partner lead (garage registration) -------------------------------
// Rate limit: 5 submissions / 5 minutes (per WhatsApp or garage name)
const limiterPartner = new RateLimiterMemory({ points: 5, duration: 300 });

app.post("/partner/lead", async (req, res) => {
  try {
    const {
      garageName = "",
      services = [],
      about = "",
      location = "",
      whatsapp = "",
      website = "",
      instagram = "",
      options = {},
    } = req.body || {};

    // Basic validation
    if (String(garageName).trim().length < 2) {
      return res.status(400).json({ ok: false, error: "garageName required" });
    }
    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ ok: false, error: "At least one service required" });
    }

    // Rate limit key
    const rlKey = (whatsapp || garageName).toLowerCase();
    await limiterPartner.consume(rlKey);

    const safe = (s) => String(s ?? "").slice(0, 4000);
    const safeArr = (arr) => (Array.isArray(arr) ? arr.map((x) => safe(x)) : []);
    const serviceList = safeArr(services).join(", ");

    const subject = `Garage registration - ${safe(garageName)} - ${serviceList}`;

    const html = `
      <div style="font-family:Inter,Segoe UI,system-ui,sans-serif;font-size:14px;color:#111">
        <h2 style="margin:0 0 8px">${APP_NAME} — New Garage Registration</h2>
        <table style="border-collapse:collapse;width:100%;max-width:700px">
          <tr><td style="padding:6px 0;width:160px"><strong>Garage</strong></td><td>${safe(garageName)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Services</strong></td><td>${serviceList}</td></tr>
          <tr><td style="padding:6px 0"><strong>About</strong></td><td>${safe(about).replace(/\n/g, "<br/>")}</td></tr>
          <tr><td style="padding:6px 0"><strong>Location</strong></td><td>${safe(location)}</td></tr>
          <tr><td style="padding:6px 0"><strong>WhatsApp</strong></td><td>${safe(whatsapp)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Website</strong></td><td>${safe(website)}</td></tr>
          <tr><td style="padding:6px 0"><strong>Instagram</strong></td><td>${safe(instagram)}</td></tr>
          <tr><td style="padding:6px 0;vertical-align:top"><strong>Options</strong></td>
              <td><pre style="margin:0;background:#f3f4f6;padding:8px;border-radius:6px;white-space:pre-wrap">${safe(JSON.stringify(options, null, 2))}</pre></td></tr>
        </table>
      </div>
    `;

    const text = `
${APP_NAME} — New Garage Registration

Garage: ${safe(garageName)}
Services: ${serviceList}
About:
${safe(about)}

Location: ${safe(location)}
WhatsApp: ${safe(whatsapp)}
Website: ${safe(website)}
Instagram: ${safe(instagram)}

Options:
${safe(JSON.stringify(options, null, 2))}
    `.trim();

    if (!SENDGRID_KEY) {
      console.warn("No SENDGRID_KEY set; skipping email send for partner lead");
      return res.status(200).json({ ok: true, note: "email skipped (no key)" });
    }

    await sgMail.send({
      to: REPLYTO, // support@yallafinder.com
      from: { email: SENDER, name: APP_NAME }, // no-reply@yallafinder.com
      replyTo: REPLYTO,
      subject,
      text,
      html,
    });

    return res.json({ ok: true });
  } catch (e) {
    if (e && typeof e === "object" && "remainingPoints" in e) {
      return res.status(429).json({ ok: false, error: "Too many requests" });
    }
    console.error("partner/lead error:", e);
    return res.status(500).json({ ok: false, error: "Server error" });
  }
});

export const api = functions.https.onRequest(app);
