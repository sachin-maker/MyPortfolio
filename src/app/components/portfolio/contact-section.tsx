
"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  LoaderCircle,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import ScrollReveal from "./scroll-reveal";

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#0d0d16] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/10";

export default function ContactSection() {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateField(field: keyof FormData, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setStatus("idle");
    setStatusMessage("");
  }

  function validate(): boolean {
    const nextErrors: FieldErrors = {};

    if (form.name.trim().length < 2 || form.name.trim().length > 80) {
      nextErrors.name = "Name must contain 2–80 characters.";
    }

    if (
      form.email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (form.subject.trim().length < 3 || form.subject.trim().length > 120) {
      nextErrors.subject = "Subject must contain 3–120 characters.";
    }

    if (
      form.message.trim().length < 10 ||
      form.message.trim().length > 3000
    ) {
      nextErrors.message = "Message must contain 10–3000 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting || !validate()) return;

    setSubmitting(true);
    setStatus("idle");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        const apiErrors = result.errors as
          | Record<string, string[] | undefined>
          | undefined;

        if (apiErrors) {
          const nextErrors: FieldErrors = {};

          for (const field of ["name", "email", "subject", "message"] as const) {
            const firstError = apiErrors[field]?.[0];
            if (firstError) nextErrors[field] = firstError;
          }

          setErrors(nextErrors);
        }

        throw new Error(
          result.message || "Unable to send your message right now."
        );
      }

      setStatus("success");
      setStatusMessage(result.message || "Your message was received.");
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      id="contact"
      className="relative overflow-hidden border-t border-white/[0.06] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="pointer-events-none absolute -right-32 top-20 h-80 w-80 rounded-full bg-violet-600/[0.09] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Contact
          </p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Have a project in mind?
            <span className="gradient-text block">Let&apos;s talk.</span>
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
            Have an opportunity, an interesting idea, or a question?
            Send me a message and let&apos;s explore how we can work together.
          </p>
        </ScrollReveal>

        <div className="mt-12 grid gap-10 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <ScrollReveal delay={0.1}>
            <div className="glass-panel rounded-2xl p-6 md:p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
                <Mail size={22} aria-hidden="true" />
              </div>

              <h3 className="mt-6 text-xl font-semibold text-white">
                Let&apos;s connect
              </h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                I&apos;m interested in meaningful projects, frontend
                engineering opportunities, and building great user
                experiences.
              </p>

              <div className="mt-7 flex items-center gap-3 text-sm text-zinc-300">
                <MessageSquare
                  size={17}
                  className="text-violet-300"
                  aria-hidden="true"
                />
                <span>Typically respond as soon as possible</span>
              </div>

              <a
                href="#contact-form"
                className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-violet-300 transition hover:text-violet-200"
              >
                Send a message
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.18}>
            <form
              id="contact-form"
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block text-sm font-medium text-zinc-300">
                  Name *
                  <input
                    required
                    autoComplete="name"
                    maxLength={80}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "contact-name-error" : undefined}
                    className={`${fieldClass} ${errors.name ? "border-red-400/60" : ""}`}
                    placeholder="Your name"
                  />
                  {errors.name && (
                    <span id="contact-name-error" className="mt-1 block text-xs text-red-300">
                      {errors.name}
                    </span>
                  )}
                </label>

                <label className="block text-sm font-medium text-zinc-300">
                  Email *
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "contact-email-error" : undefined}
                    className={`${fieldClass} ${errors.email ? "border-red-400/60" : ""}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && (
                    <span id="contact-email-error" className="mt-1 block text-xs text-red-300">
                      {errors.email}
                    </span>
                  )}
                </label>
              </div>

              <label className="mt-5 block text-sm font-medium text-zinc-300">
                Subject *
                <input
                  required
                  maxLength={120}
                  value={form.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  aria-invalid={Boolean(errors.subject)}
                  aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                  className={`${fieldClass} ${errors.subject ? "border-red-400/60" : ""}`}
                  placeholder="What would you like to discuss?"
                />
                {errors.subject && (
                  <span id="contact-subject-error" className="mt-1 block text-xs text-red-300">
                    {errors.subject}
                  </span>
                )}
              </label>

              <label className="mt-5 block text-sm font-medium text-zinc-300">
                Message *
                <textarea
                  required
                  rows={5}
                  maxLength={3000}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : "contact-message-count"}
                  className={`${fieldClass} resize-y ${errors.message ? "border-red-400/60" : ""}`}
                  placeholder="Tell me a little about your project or opportunity..."
                />
                {errors.message && (
                  <span id="contact-message-error" className="mt-1 block text-xs text-red-300">
                    {errors.message}
                  </span>
                )}
                <span id="contact-message-count" className="mt-1 block text-right text-xs text-zinc-500">
                  {form.message.length}/3000
                </span>
              </label>

              <div
                className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
                aria-hidden="true"
              >
                <label>
                  Website
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => updateField("website", e.target.value)}
                  />
                </label>
              </div>

              {statusMessage && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`mt-5 text-sm ${
                    status === "success" ? "text-emerald-300" : "text-red-300"
                  }`}
                >
                  {status === "success" && (
                    <CheckCircle2
                      size={16}
                      className="mr-2 inline"
                      aria-hidden="true"
                    />
                  )}
                  {statusMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send message
                    <Send size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
