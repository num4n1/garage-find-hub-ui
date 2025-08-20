// functions/waitlist.js
import * as functions from "firebase-functions";
import admin from "firebase-admin";
import sgMail from "@sendgrid/mail";

// GUARDED INIT HERE TOO — whichever file loads first will init once.
if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const SENDGRID_KEY =
  process.env.SENDGRID_KEY || functions.config().sg?.key || "";
const SENDER =
  process.env.SENDER || functions.config().sg?.sender || "no-reply@yallafinder.com";
const SUPPORT = "support@yallafinder.com";
const APP_NAME =
  process.env.APP_NAME || functions.config().app?.name || "YallaFinder";

if (SENDGRID_KEY) sgMail.setApiKey(SENDGRID_KEY);

// ---- HTTP: notify support on new waitlist signup
export const notifyWaitlist = functions.https.onRequest(async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST")   { res.status(405).send("Method not allowed"); return; }

  try {
    const { email } = (req.body || {});
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ ok: false, error: "Invalid email" }); return;
    }

    if (!SENDGRID_KEY) {
      res.status(200).json({ ok: true, note: "No SENDGRID_KEY set; skipped email" }); return;
    }

    await sgMail.send({
      to: SUPPORT,
      from: SENDER,
      replyTo: SUPPORT,
      subject: `[${APP_NAME}] New waitlist signup`,
      html: `<p>New waitlist subscriber:</p><p><strong>${email}</strong></p>`,
    });

    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
});

// ---- Scheduled: email all waitlisters at/after launch
export const notifyLaunch = functions.pubsub
  .schedule("every 60 minutes")
  .onRun(async () => {
    const LAUNCH_TS = Date.UTC(2025, 9, 10, 0, 0, 0); // Oct 10, 2025 UTC
    if (Date.now() < LAUNCH_TS || !SENDGRID_KEY) return;

    const snap = await db
      .collection("waitlist")
      .where("notified", "==", false)
      .limit(500)
      .get();
    if (snap.empty) return;

    const msgs = snap.docs.map((d) => {
      const { email } = d.data();
      return {
        to: email,
        from: SENDER,
        replyTo: SUPPORT,
        subject: `${APP_NAME} is live!`,
        html: `<p>We're live 🎉</p><p>Come try <strong>${APP_NAME}</strong> now.</p>`,
      };
    });

    await sgMail.send(msgs, true);

    const batch = db.batch();
    snap.docs.forEach((doc) => batch.update(doc.ref, { notified: true }));
    await batch.commit();
  });
