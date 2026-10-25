
import { Code2, Gauge, Layers3, Sparkles } from "lucide-react";
import ScrollReveal from "./scroll-reveal";

const strengths = [
  {
    icon: Code2,
    title: "Frontend engineering",
    description:
      "Building responsive, accessible interfaces with React, Next.js, and TypeScript.",
  },
  {
    icon: Layers3,
    title: "Scalable architecture",
    description:
      "Creating reusable components, maintainable code, and reliable API integrations.",
  },
  {
    icon: Gauge,
    title: "Performance focused",
    description:
      "Improving loading speed, rendering efficiency, and the overall user experience.",
  },
  {
    icon: Sparkles,
    title: "Thoughtful experiences",
    description:
      "Combining polished visual design with intuitive interactions and usability.",
  },
];

export default function AboutSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-y border-white/[0.06] px-6 py-24 md:px-12 md:py-32"
    >
      <div className="pointer-events-none absolute -left-32 top-20 h-72 w-72 rounded-full bg-violet-600/[0.08] blur-[110px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <ScrollReveal>
            <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
              About me
            </p>

            <h2 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white md:text-5xl">
              Turning ideas into
              <span className="gradient-text">
                {" "}digital experiences.
              </span>
            </h2>

            <p className="mt-6 text-base leading-8 text-zinc-400">
              I&apos;m a frontend developer with 4+ years of experience
              building responsive and user-friendly web applications.
              I enjoy turning complex requirements into clean,
              maintainable, and engaging digital experiences.
            </p>

            <p className="mt-4 text-base leading-8 text-zinc-400">
              My work focuses on reusable component architecture,
              API integration, state management, and frontend
              performance. I also work with Next.js, TypeScript,
              and backend technologies as I continue expanding my
              full-stack engineering skills.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["React", "Next.js", "TypeScript", "Redux Toolkit", "Node.js"].map(
                (technology) => (
                  <span
                    key={technology}
                    className="rounded-full border border-violet-400/15 bg-violet-500/[0.06] px-3 py-1.5 text-xs font-medium text-violet-200"
                  >
                    {technology}
                  </span>
                )
              )}
            </div>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2">
            {strengths.map((strength, index) => {
              const Icon = strength.icon;

              return (
                <ScrollReveal key={strength.title} delay={index * 0.08}>
                  <article className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(139,92,246,0.07)] md:p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500/15">
                      <Icon size={21} aria-hidden="true" />
                    </div>

                    <h3 className="mt-5 font-semibold text-white">
                      {strength.title}
                    </h3>

                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                      {strength.description}
                    </p>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
