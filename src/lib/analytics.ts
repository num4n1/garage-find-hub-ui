declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    gtag?: (...args: any[]) => void;
  }
}

function fbqTrack(event: string, params?: Record<string, any>) {
  try { window.fbq?.("track", event, params); } catch {}
}
function fbqTrackCustom(event: string, params?: Record<string, any>) {
  try { window.fbq?.("trackCustom", event, params); } catch {}
}
function gtagEvent(event: string, params?: Record<string, any>) {
  try { window.gtag?.("event", event, params); } catch {}
}

/** WhatsApp click -> Meta: Contact, custom: WhatsAppClick | GA4: whatsapp_click */
export function trackWhatsAppClick(opts: { service?: string; garageId?: string }) {
  const base = { service: opts.service || "", garage_id: opts.garageId || "", page_path: location.pathname + location.search };
  fbqTrack("Contact", base);
  fbqTrackCustom("WhatsAppClick", base);
  gtagEvent("whatsapp_click", base);
}

/** Call click -> Meta: Contact, custom: PhoneCallClick | GA4: phone_call_click */
export function trackCallClick(opts: { service?: string; garageId?: string }) {
  const base = { service: opts.service || "", garage_id: opts.garageId || "", page_path: location.pathname + location.search };
  fbqTrack("Contact", base);
  fbqTrackCustom("PhoneCallClick", base);
  gtagEvent("phone_call_click", base);
}

/** OTP login success -> Meta: Login, custom: OtpLoginSuccess | GA4: login */
export function trackOtpLoginSuccess(opts?: { method?: "otp" | "phone" | "email" }) {
  const base = { method: opts?.method || "otp", page_path: location.pathname + location.search };
  fbqTrack("Login", base);            // or CompleteRegistration if you prefer
  fbqTrackCustom("OtpLoginSuccess", base);
  gtagEvent("login", base);
}

/** Waitlist sign-up -> Meta: Lead, custom: WaitlistSignup | GA4: sign_up */
export function trackWaitlistSignup(opts?: { source?: string }) {
  const base = { source: opts?.source || "waitlist", page_path: location.pathname + location.search };
  fbqTrack("Lead", base);
  fbqTrackCustom("WaitlistSignup", base);
  gtagEvent("sign_up", { method: base.source, ...base });
}
