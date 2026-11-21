import { describe, expect, it, vi } from "vitest";
import { createReminderSenders, type ReminderSenderConfig } from "./reminder-senders";
import { ReminderDeliveryError } from "./errors";
import { REMINDER_COPY } from "./reminders";

const sub = { endpoint: "https://push.example/abc", keys: { p256dh: "p", auth: "a" } };

function config(overrides: Partial<ReminderSenderConfig> = {}): ReminderSenderConfig {
  return { vapid: null, resend: null, from: "Daily <d@example.com>", siteUrl: "https://example.com", emailFor: async () => "learner@example.com", ...overrides };
}

describe("createReminderSenders", () => {
  it("reports push as skipped when VAPID keys aren't configured", async () => {
    expect(await createReminderSenders(config()).sendPush(sub, REMINDER_COPY.fr)).toBe("skipped");
  });

  it("sends the reminder email with a link back to today's page", async () => {
    const send = vi.fn(async () => ({ data: { id: "1" }, error: null }));
    const senders = createReminderSenders(config({ resend: { emails: { send } } as unknown as ReminderSenderConfig["resend"] }));
    await senders.sendEmail("user-1", REMINDER_COPY.es);
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: "learner@example.com", text: expect.stringContaining("https://example.com/spanish?start=1") }));
  });

  it("throws a delivery error when the learner has no email address", async () => {
    const send = vi.fn();
    const senders = createReminderSenders(config({ resend: { emails: { send } } as unknown as ReminderSenderConfig["resend"], emailFor: async () => null }));
    await expect(senders.sendEmail("user-1", REMINDER_COPY.fr)).rejects.toBeInstanceOf(ReminderDeliveryError);
    expect(send).not.toHaveBeenCalled();
  });

  it("throws a delivery error when the email provider rejects it", async () => {
    const send = vi.fn(async () => ({ data: null, error: { message: "domain not verified" } }));
    const senders = createReminderSenders(config({ resend: { emails: { send } } as unknown as ReminderSenderConfig["resend"] }));
    await expect(senders.sendEmail("user-1", REMINDER_COPY.fr)).rejects.toThrow(/domain not verified/);
  });
});
