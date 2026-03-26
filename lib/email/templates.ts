/**
 * Email templates — fully inline CSS, table-based layout.
 * Compatible with Gmail, Outlook, Apple Mail, and all major clients.
 *
 * Design system:
 *  - Dark header: #0a0a0a with the MO geometric badge
 *  - Card body: #ffffff, border #e5e5e5, radius 16px
 *  - Typography: system font stack, same rhythm as the website
 *  - Palette: #0a0a0a (ink), #444 (body), #999 (muted), #ebebeb (rule)
 *  - Responsive via @media max-width: 600px
 */

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaelojekunle.dev";

const F =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

// ── Helpers ──────────────────────────────────────────────────────────────────

function unsubUrl(email: string): string {
  return `${SITE_URL}/api/unsubscribe?t=${Buffer.from(email).toString("base64url")}`;
}

/** Thin horizontal rule — no extra outer padding, caller controls spacing via surrounding tds */
const HR = `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
  <tr><td style="border-top:1px solid #ebebeb;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</td></tr>
</table>`;

/** Section label — WRITING / READING / BUILDING / LEARNING */
function label(text: string): string {
  return `<p style="margin:0;font-family:${F};font-size:10px;font-weight:700;color:#999;letter-spacing:2px;text-transform:uppercase;">${text}</p>`;
}

/** Category pill badge (used in blog post header) */
function pill(text: string): string {
  return `<span style="display:inline-block;padding:4px 12px;background-color:#f4f4f4;border-radius:100px;font-family:${F};font-size:11px;font-weight:600;color:#555;letter-spacing:0.5px;">${text}</span>`;
}

/** Dark CTA button */
function cta(text: string, url: string): string {
  return `<!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height:42px;v-text-anchor:middle;width:180px;" arcsize="19%" stroke="f" fillcolor="#0a0a0a"><w:anchorlock/><center style="color:#ffffff;font-family:${F};font-size:13px;font-weight:600;">${text} →</center></v:roundrect><![endif]-->
<!--[if !mso]><!-->
<a href="${url}" style="background-color:#0a0a0a;border-radius:8px;color:#ffffff;display:inline-block;font-family:${F};font-size:13px;font-weight:600;line-height:42px;text-align:center;text-decoration:none;padding:0 24px;letter-spacing:-0.2px;mso-hide:all;">${text}&nbsp;&rarr;</a>
<!--<![endif]-->`;
}

/** Horizontal progress bar — table-based for Outlook */
function progressBar(pct: number, width = 220): string {
  const fill = Math.max(0, Math.min(100, pct));
  const fillW = Math.round((fill / 100) * width);
  return `<table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${width}">
  <tr>
    <td style="background-color:#f0f0f0;border-radius:100px;height:3px;line-height:3px;font-size:0;overflow:hidden;">
      <!--[if gte mso 15]>
      <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${fillW}"><tr><td style="background-color:#0a0a0a;height:3px;line-height:3px;font-size:0;">&nbsp;</td></tr></table>
      <![endif]-->
      <!--[if !mso]><!-->
      <div style="background-color:#0a0a0a;border-radius:100px;height:3px;width:${fill}%;mso-hide:all;">&nbsp;</div>
      <!--<![endif]-->
    </td>
  </tr>
</table>`;
}

// ── MO logo header (dark strip at top of card) ────────────────────────────────

function emailHeader(): string {
  return `<tr>
  <td class="eh" style="background-color:#0a0a0a;border-radius:16px 16px 0 0;padding:36px 48px;">
    <table role="presentation" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <!-- M badge -->
        <td style="vertical-align:middle;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0">
            <tr>
              <td style="width:52px;height:52px;background-color:#161616;border:1px solid rgba(255,255,255,0.12);border-radius:10px;text-align:center;vertical-align:middle;line-height:52px;">
                <span style="font-family:${F};font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-1.5px;">M</span>
              </td>
            </tr>
          </table>
        </td>
        <!-- Name + role -->
        <td style="padding-left:14px;vertical-align:middle;">
          <p style="margin:0 0 3px 0;font-family:${F};font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;line-height:1.2;">Michael Ojekunle</p>
          <p style="margin:0;font-family:${F};font-size:12px;color:#555;letter-spacing:0.2px;line-height:1.2;">Full-Stack &amp; Web3 Developer</p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// ── Shell ─────────────────────────────────────────────────────────────────────

function shell(
  previewText: string,
  bodyContent: string,
  subscriberEmail: string
): string {
  const unsub = unsubUrl(subscriberEmail);

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no">
  <!--[if gte mso 15]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <style>
    body{margin:0;padding:0;background-color:#f0f0f0;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;}
    a{text-decoration:none;}
    /* Responsive overrides */
    @media only screen and (max-width:620px){
      .eo{padding:0 !important;}
      .ec{width:100% !important;}
      .eh{padding:28px 24px !important;border-radius:12px 12px 0 0 !important;}
      .eb{padding:28px 24px !important;border-radius:0 0 12px 12px !important;}
      .ef{padding:20px 16px !important;}
      .h1{font-size:24px !important;letter-spacing:-0.5px !important;}
      .h2{font-size:18px !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;word-spacing:normal;">

  <!--[if !mso]><!-->
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${previewText}&nbsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;&zwnj;&hairsp;</div>
  <!--<![endif]-->

  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td class="eo" align="center" style="padding:48px 16px;">

        <!-- ═══ Card ═══ -->
        <table role="presentation" class="ec" border="0" cellspacing="0" cellpadding="0" width="580" style="max-width:580px;">

          ${emailHeader()}

          <!-- Body -->
          <tr>
            <td class="eb" style="background-color:#ffffff;border:1px solid #e5e5e5;border-top:none;border-radius:0 0 16px 16px;padding:44px 48px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                ${bodyContent}
              </table>
            </td>
          </tr>

        </table>
        <!-- ═══ /Card ═══ -->

        <!-- Footer -->
        <table role="presentation" class="ec" border="0" cellspacing="0" cellpadding="0" width="580" style="max-width:580px;">
          <tr>
            <td class="ef" align="center" style="padding:28px 48px 40px;">
              <p style="margin:0 0 8px 0;font-family:${F};font-size:12px;color:#bbb;line-height:1.6;">
                <a href="${SITE_URL}" style="color:#bbb;">${SITE_URL.replace("https://", "")}</a>
              </p>
              <p style="margin:0;font-family:${F};font-size:11px;color:#ccc;line-height:1.8;">
                You&rsquo;re receiving this because you subscribed to updates.<br>
                <a href="${unsub}" style="color:#aaa;text-decoration:underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Blog post notification ────────────────────────────────────────────────────

export interface BlogPostTemplateData {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string | null;
  read_time: string | null;
}

export function blogPostEmail(
  post: BlogPostTemplateData,
  subscriberEmail: string
): { subject: string; html: string } {
  const postUrl = `${SITE_URL}/blog/${post.slug}`;
  const categoryLabel = post.category ?? "Writing";

  const content = `
    <!-- Category pill -->
    <tr>
      <td style="padding-bottom:20px;">${pill(categoryLabel)}</td>
    </tr>

    <!-- Title -->
    <tr>
      <td style="padding-bottom:${post.read_time ? "10px" : "20px"};">
        <h1 class="h1" style="margin:0;font-family:${F};font-size:30px;font-weight:700;color:#0a0a0a;line-height:1.2;letter-spacing:-0.8px;">${post.title}</h1>
      </td>
    </tr>

    ${post.read_time ? `<!-- Read time -->
    <tr>
      <td style="padding-bottom:24px;">
        <p style="margin:0;font-family:${F};font-size:12px;color:#bbb;letter-spacing:0.3px;">${post.read_time}&nbsp;read</p>
      </td>
    </tr>` : ""}

    <!-- Rule -->
    <tr><td style="padding-bottom:24px;">${HR}</td></tr>

    ${post.excerpt ? `<!-- Excerpt -->
    <tr>
      <td style="padding-bottom:32px;">
        <p style="margin:0;font-family:${F};font-size:16px;color:#444;line-height:1.8;letter-spacing:-0.1px;">${post.excerpt}</p>
      </td>
    </tr>` : ""}

    <!-- CTA -->
    <tr>
      <td>
        ${cta("Read the post", postUrl)}
      </td>
    </tr>`;

  return {
    subject: `New post: ${post.title}`,
    html: shell(
      `${post.excerpt?.slice(0, 120) ?? `A new ${categoryLabel.toLowerCase()} post is live.`}`,
      content,
      subscriberEmail
    ),
  };
}

// ── What's new digest ─────────────────────────────────────────────────────────

export interface DigestData {
  posts: Array<{
    title: string;
    slug: string;
    category: string | null;
    excerpt: string | null;
  }>;
  books: Array<{
    title: string;
    author: string;
    progress: number;
    status: string;
    latestNote?: string | null;
  }>;
  learning: Array<{ name: string; progress: number }>;
  building: Array<{ name: string; status: string; description: string | null }>;
}

export function digestEmail(
  data: DigestData,
  subscriberEmail: string
): { subject: string; html: string } {
  const monthYear = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const hasPosts = data.posts.length > 0;
  const hasBooks = data.books.length > 0;
  const hasBuilding = data.building.length > 0;
  const hasLearning = data.learning.length > 0;

  let content = `
    <!-- Intro -->
    <tr>
      <td style="padding-bottom:6px;">
        <h1 class="h1" style="margin:0;font-family:${F};font-size:26px;font-weight:700;color:#0a0a0a;letter-spacing:-0.6px;">What I&rsquo;ve been up&nbsp;to</h1>
      </td>
    </tr>
    <tr>
      <td style="padding-bottom:28px;">
        <p style="margin:0;font-family:${F};font-size:12px;color:#bbb;letter-spacing:0.5px;text-transform:uppercase;">${monthYear}</p>
      </td>
    </tr>
    <tr><td style="padding-bottom:28px;">${HR}</td></tr>`;

  // ── Writing ──────────────────────────────────────────────────────────────
  if (hasPosts) {
    content += `
    <tr><td style="padding-bottom:14px;">${label("Writing")}</td></tr>
    <tr>
      <td style="padding-bottom:${hasBooks || hasBuilding || hasLearning ? "28px" : "8px"};">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          ${data.posts.map((p, i) => `
          <tr>
            <td style="padding-bottom:${i < data.posts.length - 1 ? "18px" : "0"};">
              <a href="${SITE_URL}/blog/${p.slug}" style="text-decoration:none;">
                ${p.category ? `<p style="margin:0 0 4px 0;font-family:${F};font-size:10px;font-weight:700;color:#bbb;letter-spacing:1.5px;text-transform:uppercase;">${p.category}</p>` : ""}
                <p style="margin:0 0 4px 0;font-family:${F};font-size:15px;font-weight:600;color:#0a0a0a;letter-spacing:-0.3px;line-height:1.3;">${p.title}</p>
                ${p.excerpt ? `<p style="margin:0;font-family:${F};font-size:13px;color:#888;line-height:1.65;">${p.excerpt.slice(0, 110)}${p.excerpt.length > 110 ? "&hellip;" : ""}</p>` : ""}
              </a>
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>
    ${hasBooks || hasBuilding || hasLearning ? `<tr><td style="padding-bottom:28px;">${HR}</td></tr>` : ""}`;
  }

  // ── Reading ───────────────────────────────────────────────────────────────
  if (hasBooks) {
    content += `
    <tr><td style="padding-bottom:14px;">${label("Reading")}</td></tr>
    <tr>
      <td style="padding-bottom:${hasBuilding || hasLearning ? "28px" : "8px"};">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          ${data.books.map((b, i) => `
          <tr>
            <td style="padding-bottom:${i < data.books.length - 1 ? "20px" : "0"};">
              <p style="margin:0 0 2px 0;font-family:${F};font-size:14px;font-weight:600;color:#0a0a0a;letter-spacing:-0.2px;">${b.title}</p>
              <p style="margin:0 0 8px 0;font-family:${F};font-size:12px;color:#aaa;">by ${b.author}&nbsp;&middot;&nbsp;${b.progress}%</p>
              ${progressBar(b.progress)}
              ${b.latestNote ? `<p style="margin:10px 0 0 0;font-family:${F};font-size:13px;color:#666;font-style:italic;line-height:1.7;padding-left:12px;border-left:2px solid #e5e5e5;">&ldquo;${b.latestNote}&rdquo;</p>` : ""}
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>
    ${hasBuilding || hasLearning ? `<tr><td style="padding-bottom:28px;">${HR}</td></tr>` : ""}`;
  }

  // ── Building ──────────────────────────────────────────────────────────────
  if (hasBuilding) {
    content += `
    <tr><td style="padding-bottom:14px;">${label("Building")}</td></tr>
    <tr>
      <td style="padding-bottom:${hasLearning ? "28px" : "8px"};">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          ${data.building.map((p, i) => `
          <tr>
            <td style="padding-bottom:${i < data.building.length - 1 ? "16px" : "0"};">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:middle;">
                    <span style="font-family:${F};font-size:14px;font-weight:600;color:#0a0a0a;letter-spacing:-0.2px;">${p.name}</span>
                  </td>
                  <td style="padding-left:8px;vertical-align:middle;">
                    <span style="display:inline-block;padding:2px 9px;background-color:#f4f4f4;border-radius:100px;font-family:${F};font-size:10px;font-weight:600;color:#777;letter-spacing:0.3px;">${p.status}</span>
                  </td>
                </tr>
              </table>
              ${p.description ? `<p style="margin:5px 0 0 0;font-family:${F};font-size:13px;color:#888;line-height:1.65;">${p.description}</p>` : ""}
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>
    ${hasLearning ? `<tr><td style="padding-bottom:28px;">${HR}</td></tr>` : ""}`;
  }

  // ── Learning ──────────────────────────────────────────────────────────────
  if (hasLearning) {
    content += `
    <tr><td style="padding-bottom:14px;">${label("Learning")}</td></tr>
    <tr>
      <td style="padding-bottom:8px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          ${data.learning.map((l, i) => `
          <tr>
            <td style="padding-bottom:${i < data.learning.length - 1 ? "14px" : "0"};">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                <tr>
                  <td><span style="font-family:${F};font-size:13px;font-weight:500;color:#0a0a0a;">${l.name}</span></td>
                  <td align="right"><span style="font-family:${F};font-size:12px;color:#bbb;">${l.progress}%</span></td>
                </tr>
              </table>
              <div style="margin-top:6px;">${progressBar(l.progress, 480)}</div>
            </td>
          </tr>`).join("")}
        </table>
      </td>
    </tr>`;
  }

  // ── Footer CTA ────────────────────────────────────────────────────────────
  content += `
    <tr><td style="padding-top:32px;padding-bottom:4px;">${HR}</td></tr>
    <tr>
      <td style="padding-top:28px;">
        ${cta("Visit the site", SITE_URL)}
      </td>
    </tr>`;

  return {
    subject: `What I've been up to — ${monthYear}`,
    html: shell(
      `Updates on what I'm reading, building, and learning this ${monthYear}.`,
      content,
      subscriberEmail
    ),
  };
}

// ── Custom / free-form ────────────────────────────────────────────────────────

export function customEmail(
  subject: string,
  body: string,
  subscriberEmail: string
): { subject: string; html: string } {
  // Split on double newlines → paragraphs; single newlines → <br>
  const paragraphs = body
    .trim()
    .split(/\n{2,}/)
    .map(
      (para) =>
        `<p style="margin:0 0 18px 0;font-family:${F};font-size:16px;color:#333;line-height:1.8;letter-spacing:-0.1px;">${para.replace(/\n/g, "<br>")}</p>`
    )
    .join("\n");

  const content = `
    <!-- Subject as headline -->
    <tr>
      <td style="padding-bottom:24px;">
        <h1 class="h1" style="margin:0;font-family:${F};font-size:26px;font-weight:700;color:#0a0a0a;letter-spacing:-0.6px;line-height:1.3;">${subject}</h1>
      </td>
    </tr>
    <tr><td style="padding-bottom:28px;">${HR}</td></tr>

    <!-- Body -->
    <tr>
      <td style="padding-bottom:8px;">
        ${paragraphs}
      </td>
    </tr>

    <!-- Signature -->
    <tr>
      <td style="padding-top:8px;">
        <p style="margin:0;font-family:${F};font-size:14px;color:#aaa;letter-spacing:-0.1px;">&mdash;&nbsp;Michael</p>
      </td>
    </tr>`;

  return {
    subject,
    html: shell(
      subject,
      content,
      subscriberEmail
    ),
  };
}

// ── Contact notification (to Michael) ────────────────────────────────────────

export function contactNotificationEmail(opts: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const adminUrl = `${SITE_URL}/admin/messages`;

  const content = `
    <!-- Label -->
    <tr>
      <td style="padding-bottom:16px;">${pill("New message")}</td>
    </tr>

    <!-- Subject -->
    <tr>
      <td style="padding-bottom:20px;">
        <h1 class="h1" style="margin:0;font-family:${F};font-size:24px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;line-height:1.3;">${opts.subject}</h1>
      </td>
    </tr>
    <tr><td style="padding-bottom:20px;">${HR}</td></tr>

    <!-- Meta row -->
    <tr>
      <td style="padding-bottom:20px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          <tr>
            <td style="width:50%;vertical-align:top;padding-right:12px;">
              <p style="margin:0 0 3px 0;font-family:${F};font-size:10px;font-weight:700;color:#bbb;letter-spacing:1.5px;text-transform:uppercase;">From</p>
              <p style="margin:0;font-family:${F};font-size:14px;color:#0a0a0a;font-weight:500;">${opts.name}</p>
              <p style="margin:2px 0 0 0;font-family:${F};font-size:13px;color:#888;">${opts.email}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="padding-bottom:20px;">${HR}</td></tr>

    <!-- Message body -->
    <tr>
      <td style="padding-bottom:28px;">
        <p style="margin:0;font-family:${F};font-size:15px;color:#444;line-height:1.8;white-space:pre-wrap;">${opts.message}</p>
      </td>
    </tr>

    <!-- CTAs -->
    <tr>
      <td>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-right:12px;">${cta("View in admin", adminUrl)}</td>
            <td>
              <a href="mailto:${opts.email}?subject=Re: ${encodeURIComponent(opts.subject)}" style="display:inline-block;font-family:${F};font-size:13px;font-weight:500;color:#888;padding:0 4px;line-height:42px;text-decoration:none;">
                Reply via email &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return shell(
    `${opts.name} sent you a message via michaelojekunle.dev`,
    content,
    "admin"
  );
}

// ── Contact confirmation (to the sender) ─────────────────────────────────────

export function contactConfirmationEmail(name: string): string {
  const content = `
    <!-- Headline -->
    <tr>
      <td style="padding-bottom:20px;">
        <h1 class="h1" style="margin:0;font-family:${F};font-size:26px;font-weight:700;color:#0a0a0a;letter-spacing:-0.6px;">Got your message.</h1>
      </td>
    </tr>
    <tr><td style="padding-bottom:24px;">${HR}</td></tr>

    <!-- Body -->
    <tr>
      <td style="padding-bottom:20px;">
        <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;color:#444;line-height:1.8;">Hi ${name},</p>
        <p style="margin:0 0 16px 0;font-family:${F};font-size:16px;color:#444;line-height:1.8;">Thanks for reaching out. I&rsquo;ve received your message and will get back to you as soon as I can — usually within a day or two.</p>
        <p style="margin:0;font-family:${F};font-size:16px;color:#444;line-height:1.8;">In the meantime, feel free to explore the site.</p>
      </td>
    </tr>

    <!-- Signature + CTA -->
    <tr>
      <td style="padding-top:8px;padding-bottom:28px;">
        <p style="margin:0 0 24px 0;font-family:${F};font-size:14px;color:#aaa;">&mdash;&nbsp;Michael</p>
        ${cta("Visit the site", SITE_URL)}
      </td>
    </tr>`;

  // Confirmation emails have no subscriber email for unsubscribe — use a no-op placeholder.
  return shell(
    "I've received your message and will be in touch soon.",
    content,
    "no-reply"
  );
}
