"use client";

import { useLang } from "./lang-context";
import { useEffect, useRef, useState, type FormEvent, type ReactElement } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { ActionButton, OutlineButton, QuietButton } from "./primitives";

interface Props {
  readonly onClose: () => void;
  /** Called after a password sign-in succeeds (OAuth redirects away instead). */
  readonly onSignedIn: () => void;
}


export function AuthPanel({ onClose, onSignedIn }: Props): ReactElement {
  const { copy, pack } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialog.current?.querySelector<HTMLElement>("button, input")?.focus();
    const onKey = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !dialog.current) return;
      // Keep Tab inside the dialog.
      const focusable = [...dialog.current.querySelectorAll<HTMLElement>("button:not([disabled]), input:not([disabled])")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [onClose]);

  const google = async (): Promise<void> => {
    const { error } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${pack.route}` },
    });
    if (error) {
      console.error("[learn] google sign-in failed", error);
      toast.error(error.message);
    }
  };

  const submit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setBusy(true);
    try {
      const auth = createClient().auth;
      if (creating) {
        const { error } = await auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${pack.route}` } });
        if (error) throw error;
        toast.success("Check your inbox to confirm your account.");
      } else {
        const { error } = await auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSignedIn();
      }
    } catch (caught) {
      console.error("[learn] email auth failed", caught);
      toast.error(caught instanceof Error ? caught.message : "Sign-in didn't work. Check your email and password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-black/50 sm:place-items-center sm:p-5"
      // pointerdown, not click: dragging a text selection out of a field must not close the panel.
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fr-auth-title"
        className="fr-enter relative w-full max-w-md bg-(--fr-paper) px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-6 shadow-[0_-8px_40px_rgb(0_0_0/0.25)] sm:rounded-(--fr-radius)"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-2 top-2 grid size-11 place-items-center text-(--fr-soft) hover:text-(--fr-ink)">
          <X className="size-5" aria-hidden="true" />
        </button>
        <h2 id="fr-auth-title" className="fr-print text-[28px] font-semibold leading-8 text-(--fr-ink)">
          {creating ? copy.signUpTitle : copy.signInTitle}
        </h2>
        <p className="fr-ui mt-2 text-[15px] leading-6 text-(--fr-soft)">Your streak, your words and your corrections, on every device.</p>

        <OutlineButton onClick={() => void google()} className="mt-6 w-full">
          Continue with Google
        </OutlineButton>

        <div className="fr-ui my-4 flex items-center gap-3 text-xs text-(--fr-soft)" aria-hidden="true">
          <span className="h-px flex-1 bg-(--fr-rule)" /> or with email <span className="h-px flex-1 bg-(--fr-rule)" />
        </div>

        <form onSubmit={(event) => void submit(event)} className="space-y-3">
          <div>
            <label htmlFor="fr-email" className="fr-ui text-sm font-bold text-(--fr-ink)">
              Email
            </label>
            <input
              id="fr-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="fr-field fr-ui mt-1 min-h-12 px-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="fr-password" className="fr-ui text-sm font-bold text-(--fr-ink)">
              Password <span className="font-normal text-(--fr-soft)">· 8+ characters</span>
            </label>
            <input
              id="fr-password"
              type="password"
              required
              minLength={8}
              autoComplete={creating ? "new-password" : "current-password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="fr-field fr-ui mt-1 min-h-12 px-3 text-base"
            />
          </div>
          <ActionButton type="submit" disabled={busy} compact>
            {busy ? "One moment…" : creating ? "Create account" : "Sign in"}
          </ActionButton>
        </form>

        <QuietButton onClick={() => setCreating((value) => !value)} className="mt-2 w-full">
          {creating ? "Already have an account? Sign in" : "New here? Create a free account"}
        </QuietButton>
      </div>
    </div>
  );
}
