// HTML email templates with full inline CSS.
// These must be valid for all major email clients (Gmail, Outlook, Apple Mail).
// No external stylesheets — everything is inline.

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://michaelojekunle.dev";

const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

// Encode subscriber email for unsubscribe link.
// base64url is URL-safe without encoding.
function unsubUrl(email: string): string {
  const token = Buffer.from(email).toString("base64url");
  return `${SITE_URL}/api/unsubscribe?t=${token}`;
}

function divider(): string {
  return `
    <tr>
      <td style="padding:0 40px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          <tr><td style="border-top:1px solid #ebebeb;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>`;
}

function sectionHeader(emoji: string, label: string): string {
  return `
    <tr>
      <td style="padding:28px 40px 14px;">
        <p style="margin:0;font-family:${FONT};font-size:11px;font-weight:600;color:#999;letter-spacing:1.2px;text-transform:uppercase;">
          ${emoji}&nbsp;&nbsp;${label}
        </p>
      </td>
    </tr>`;
}

function shell(content: string, subscriberEmail: string): string {
  const unsub = unsubUrl(subscriberEmail);

  return `<!DOCTYPE html>
<html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <!--[if gte mso 15]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;word-spacing:normal;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f0f0f0">
    <tr>
      <td align="center" style="padding:44px 16px 40px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;">

          <!-- Logo -->
          <tr>
            <td style="padding-bottom:22px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:38px;height:38px;background-color:#0a0a0a;border-radius:8px;vertical-align:middle;text-align:center;line-height:38px;">
                    <span style="font-family:${FONT};font-size:16px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">M</span>
                  </td>
                  <td style="padding-left:11px;vertical-align:middle;">
                    <span style="font-family:${FONT};font-size:15px;font-weight:600;color:#0a0a0a;letter-spacing:-0.3px;">Michael Ojekunle</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:#ffffff;border:1px solid #e0e0e0;border-radius:12px;overflow:hidden;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                ${content}
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;color:#bbb;">
                <a href="${SITE_URL}" style="color:#bbb;text-decoration:none;">${SITE_URL.replace("https://", "")}</a>
              </p>
              <p style="margin:0;font-family:${FONT};font-size:11px;color:#ccc;line-height:1.7;">
                You're receiving this because you subscribed to updates.<br>
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

// ── Blog post notification ───────────────────────────────────────────────────

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

  const content = `
    <!-- Category -->
    <tr>
      <td style="padding:36px 40px 0;">
        <span style="display:inline-block;padding:4px 12px;background-color:#f4f4f4;border-radius:100px;font-family:${FONT};font-size:11px;font-weight:500;color:#666;letter-spacing:0.4px;text-transform:uppercase;">
          ${post.category ?? "Writing"}
        </span>
      </td>
    </tr>

    <!-- Title -->
    <tr>
      <td style="padding:16px 40px 0;">
        <h1 style="margin:0;font-family:${FONT};font-size:26px;font-weight:700;color:#0a0a0a;line-height:1.3;letter-spacing:-0.6px;">
          ${post.title}
        </h1>
      </td>
    </tr>

    ${
      post.read_time
        ? `<tr><td style="padding:8px 40px 0;"><span style="font-family:${FONT};font-size:12px;color:#bbb;">${post.read_time} read</span></td></tr>`
        : ""
    }

    <!-- Divider -->
    <tr>
      <td style="padding:22px 40px;">
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          <tr><td style="border-top:1px solid #ebebeb;font-size:0;line-height:0;">&nbsp;</td></tr>
        </table>
      </td>
    </tr>

    <!-- Excerpt -->
    ${
      post.excerpt
        ? `<tr><td style="padding:0 40px;"><p style="margin:0;font-family:${FONT};font-size:15px;color:#444;line-height:1.75;">${post.excerpt}</p></td></tr>`
        : ""
    }

    <!-- CTA -->
    <tr>
      <td style="padding:28px 40px 40px;">
        <a href="${postUrl}"
           style="display:inline-block;padding:11px 22px;background-color:#0a0a0a;color:#ffffff;font-family:${FONT};font-size:13px;font-weight:500;text-decoration:none;border-radius:7px;letter-spacing:-0.2px;">
          Read the post &rarr;
        </a>
      </td>
    </tr>`;

  return {
    subject: `New post: ${post.title}`,
    html: shell(content, subscriberEmail),
  };
}

// ── What's new digest ────────────────────────────────────────────────────────

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
  building: Array<{
    name: string;
    status: string;
    description: string | null;
  }>;
}

export function digestEmail(
  data: DigestData,
  subscriberEmail: string
): { subject: string; html: string } {
  const now = new Date();
  const monthYear = now.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const hasPosts = data.posts.length > 0;
  const hasBooks = data.books.length > 0;
  const hasLearning = data.learning.length > 0;
  const hasBuilding = data.building.length > 0;

  let content = `
    <!-- Intro -->
    <tr>
      <td style="padding:36px 40px 0;">
        <h1 style="margin:0 0 8px;font-family:${FONT};font-size:22px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;">
          What I&rsquo;ve been up to
        </h1>
        <p style="margin:0;font-family:${FONT};font-size:13px;color:#bbb;">${monthYear}</p>
      </td>
    </tr>`;

  // Posts section
  if (hasPosts) {
    content += `
      ${divider()}
      ${sectionHeader("✍️", "Writing")}
      <tr>
        <td style="padding:0 40px ${hasBooks || hasLearning || hasBuilding ? "0" : "36px"};">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
            ${data.posts
              .map(
                (p) => `
              <tr>
                <td style="padding-bottom:14px;">
                  <a href="${SITE_URL}/blog/${p.slug}"
                     style="display:block;text-decoration:none;">
                    <span style="display:inline-block;margin-bottom:4px;font-family:${FONT};font-size:11px;color:#bbb;letter-spacing:0.3px;text-transform:uppercase;">${p.category ?? "Post"}</span><br>
                    <span style="font-family:${FONT};font-size:15px;font-weight:600;color:#0a0a0a;letter-spacing:-0.3px;">${p.title}</span><br>
                    ${p.excerpt ? `<span style="font-family:${FONT};font-size:13px;color:#666;line-height:1.6;">${p.excerpt.slice(0, 120)}${p.excerpt.length > 120 ? "…" : ""}</span>` : ""}
                  </a>
                </td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>`;
  }

  // Books section
  if (hasBooks) {
    content += `
      ${divider()}
      ${sectionHeader("📚", "Reading")}
      <tr>
        <td style="padding:0 40px ${hasLearning || hasBuilding ? "0" : "36px"};">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
            ${data.books
              .map(
                (b) => `
              <tr>
                <td style="padding-bottom:16px;">
                  <p style="margin:0 0 2px;font-family:${FONT};font-size:14px;font-weight:600;color:#0a0a0a;">${b.title}</p>
                  <p style="margin:0 0 6px;font-family:${FONT};font-size:12px;color:#999;">by ${b.author} &middot; ${b.progress}% complete</p>
                  <!-- Progress bar -->
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="200">
                    <tr>
                      <td style="background:#f0f0f0;border-radius:100px;height:3px;overflow:hidden;">
                        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${b.progress}%">
                          <tr><td style="background:#0a0a0a;height:3px;">&nbsp;</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                  ${b.latestNote ? `<p style="margin:8px 0 0;font-family:${FONT};font-size:13px;color:#555;font-style:italic;line-height:1.6;">&ldquo;${b.latestNote}&rdquo;</p>` : ""}
                </td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>`;
  }

  // Building section
  if (hasBuilding) {
    content += `
      ${divider()}
      ${sectionHeader("🛠", "Building")}
      <tr>
        <td style="padding:0 40px ${hasLearning ? "0" : "36px"};">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
            ${data.building
              .map(
                (p) => `
              <tr>
                <td style="padding-bottom:12px;">
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="vertical-align:middle;">
                        <span style="font-family:${FONT};font-size:14px;font-weight:600;color:#0a0a0a;">${p.name}</span>
                      </td>
                      <td style="padding-left:8px;vertical-align:middle;">
                        <span style="display:inline-block;padding:2px 8px;background-color:#f4f4f4;border-radius:100px;font-family:${FONT};font-size:10px;font-weight:500;color:#666;">
                          ${p.status}
                        </span>
                      </td>
                    </tr>
                  </table>
                  ${p.description ? `<p style="margin:4px 0 0;font-family:${FONT};font-size:13px;color:#666;line-height:1.6;">${p.description}</p>` : ""}
                </td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>`;
  }

  // Learning section
  if (hasLearning) {
    content += `
      ${divider()}
      ${sectionHeader("🎓", "Learning")}
      <tr>
        <td style="padding:0 40px 36px;">
          <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
            ${data.learning
              .map(
                (l) => `
              <tr>
                <td style="padding-bottom:10px;">
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                      <td><span style="font-family:${FONT};font-size:13px;color:#0a0a0a;">${l.name}</span></td>
                      <td align="right"><span style="font-family:${FONT};font-size:12px;color:#bbb;">${l.progress}%</span></td>
                    </tr>
                  </table>
                  <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                      <td style="padding-top:5px;background:#f0f0f0;border-radius:100px;height:3px;">
                        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="${l.progress}%">
                          <tr><td style="background:#0a0a0a;height:3px;border-radius:100px;">&nbsp;</td></tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>`
              )
              .join("")}
          </table>
        </td>
      </tr>`;
  }

  // Footer CTA
  content += `
    ${divider()}
    <tr>
      <td style="padding:24px 40px 36px;text-align:center;">
        <a href="${SITE_URL}" style="display:inline-block;padding:10px 20px;border:1px solid #e0e0e0;border-radius:7px;font-family:${FONT};font-size:13px;color:#666;text-decoration:none;">
          View full portfolio &rarr;
        </a>
      </td>
    </tr>`;

  return {
    subject: `What I've been up to — ${monthYear}`,
    html: shell(content, subscriberEmail),
  };
}

// ── Custom / free-form ───────────────────────────────────────────────────────

export function customEmail(
  subject: string,
  body: string,
  subscriberEmail: string
): { subject: string; html: string } {
  // Convert newlines to <br> tags for the email body.
  const htmlBody = body
    .split("\n\n")
    .map(
      (para) =>
        `<p style="margin:0 0 16px;font-family:${FONT};font-size:15px;color:#333;line-height:1.75;">${para.replace(/\n/g, "<br>")}</p>`
    )
    .join("");

  const content = `
    <tr>
      <td style="padding:36px 40px 40px;">
        <h1 style="margin:0 0 24px;font-family:${FONT};font-size:22px;font-weight:700;color:#0a0a0a;letter-spacing:-0.5px;line-height:1.3;">
          ${subject}
        </h1>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0" width="100%">
          <tr>
            <td style="border-top:1px solid #ebebeb;padding-top:24px;">
              ${htmlBody}
            </td>
          </tr>
        </table>
        <table role="presentation" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td style="padding-top:8px;font-family:${FONT};font-size:13px;color:#999;">
              — Michael
            </td>
          </tr>
        </table>
      </td>
    </tr>`;

  return {
    subject,
    html: shell(content, subscriberEmail),
  };
}
