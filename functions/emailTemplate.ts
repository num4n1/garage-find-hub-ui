// functions/emailTemplate.ts
export function otpEmailHtml({
  appName,
  code,              // "123456"
  minutes = 10,
  brand = "#2563eb", // Tailwind "blue-600"
  support = "support@yallafinder.com",
}: {
  appName: string;
  code: string;
  minutes?: number;
  brand?: string;
  support?: string;
}) {
  // Keep styles inline / <style> minimal for Outlook compatibility
  return `
<!doctype html>
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
  <span style="display:none !important;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">
    Your ${appName} code is ${code}. It expires in ${minutes} minutes.
  </span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">
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
          <tr><td style="text-align:center;padding-top:16px;color:#9ca3af;font-size:12px;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
