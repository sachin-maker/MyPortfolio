
"use client";

import { FormEvent, useState } from "react";

type FormFields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website: string;
};

const initialForm: FormFields = {
  name: "",
  email: "",
  subject: "",
  message: "",
  website: "",
};

export default function ContactForm() {
  const [form, setForm] = useState<FormFields>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (feedback) setFeedback(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result: { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Unable to send your message. Please try again."
        );
      }

      setFeedback({
        type: "success",
        message:
          "Your message has been sent successfully. Thank you for reaching out!",
      });

      setForm(initialForm);
    } catch (error) {
      setFeedback({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20";

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-sm font-medium text-zinc-200">
            Your name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="John Doe"
            minLength={2}
            maxLength={80}
            value={form.name}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-zinc-200">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            maxLength={254}
            value={form.email}
            onChange={handleChange}
            className={inputClass}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="text-sm font-medium text-zinc-200">
          Subject
        </label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="Let's discuss a project"
          minLength={3}
          maxLength={120}
          value={form.subject}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="text-sm font-medium text-zinc-200">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows={6}
          placeholder="Tell me a little about your project or opportunity..."
          minLength={10}
          maxLength={3000}
          value={form.message}
          onChange={handleChange}
          className={`${inputClass} resize-y`}
          required
        />
        <p className="mt-2 text-right text-xs text-zinc-500">
          {form.message.length}/3000 characters
        </p>
      </div>

      {/* Honeypot: keep hidden from normal visitors. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={handleChange}
        />
      </div>

      {feedback && (
        <div
          role={feedback.type === "success" ? "status" : "alert"}
          aria-live="polite"
          className={`rounded-xl border p-4 text-sm ${
            feedback.type === "success"
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {feedback.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-violet-500 px-6 py-3.5 font-medium text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isSubmitting ? (
          <>
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden="true"
            />
            Sending message...
          </>
        ) : (
          "Send message"
        )}
        {!isSubmitting && <span aria-hidden="true">→</span>}
      </button>

      <p className="text-xs leading-5 text-zinc-500">
        Your details will be used to respond to your message.
      </p>
    </form>
  );
}
