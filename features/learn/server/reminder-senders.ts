/**
 * Push (Web Push / VAPID) and email (Resend) delivery for the reminder job.
 * Configuration is read by the caller and passed in, so this stays testable.
 */
import webpush from "web-push";
import type { Resend } from "resend";
import { ReminderDeliveryError } from "./errors";
import type { ReminderJobDeps, ReminderMessage } from "./reminders";

export interface ReminderSenderConfig {
  readonly vapid: { readonly publicKey: string; readonly privateKey: string; readonly contact: string } | null;
  readonly resend: Pick<Resend, "emails"> | null;
  readonly from: string;
  readonly siteUrl: string;
  readonly emailFor: (userId: string) => Promise<string | null>;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c);
}

export function createReminderSenders(config: ReminderSenderConfig): Pick<ReminderJobDeps, "sendPush" | "sendEmail"> {
  if (config.vapid) webpush.setVapidDetails(`mailto:${config.vapid.contact}`, config.vapid.publicKey, config.vapid.privateKey);

  return {
    sendPush: async (subscription, message: ReminderMessage) => {
      if (!config.vapid) return "skipped";
      try {
        await webpush.sendNotification(subscription, JSON.stringify({ title: message.title, body: message.body, url: message.url }));
        return "sent";
      } catch (error) {
        const status = typeof error === "object" && error !== null && "statusCode" in error ? Number(error.statusCode) : 0;
        if (status === 404 || status === 410) return "gone";
        throw new ReminderDeliveryError(`Push failed (HTTP ${status || "unknown"})`, { cause: error });
      }
    },
    sendEmail: async (userId, message) => {
      if (!config.resend) return "skipped";
      const to = await config.emailFor(userId);
      if (!to) throw new ReminderDeliveryError("No email address for this learner.");
      const link = `${config.siteUrl}${message.url}`;
      const { error } = await config.resend.emails.send({
        from: config.from,
        to,
        subject: message.title,
        text: `${message.body}\n\n${link}`,
        html: `<p style="font-family:Georgia,serif;font-size:18px">${escapeHtml(message.body)}</p><p><a href="${escapeHtml(link)}">${message.language === "fr" ? "Commencer" : "Empezar"} →</a></p>`,
      });
      if (error) throw new ReminderDeliveryError(`Email provider rejected the reminder: ${error.message}`);
      return "sent";
    },
  };
}
