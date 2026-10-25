
import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Sachin Deshpande about frontend development opportunities and projects.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-4xl items-center px-6 py-20">
      <section className="glass-panel w-full rounded-3xl p-6 md:p-12">
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
          Contact
        </p>

        <h1 className="mt-4 text-4xl font-semibold md:text-5xl">
          Let&apos;s connect.
        </h1>

        <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
          Have a project in mind, a frontend opportunity, or just want to
          connect? Send me a message and I&apos;ll get back to you.
        </p>

        <ContactForm />
      </section>
    </main>
  );
}
