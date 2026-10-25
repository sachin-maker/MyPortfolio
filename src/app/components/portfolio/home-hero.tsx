"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,

} from "lucide-react";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 22,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: "easeOut" as const,
    },
  },
};

export default function HomeHero() {
  const shouldReduceMotion = useReducedMotion();

  const variants = shouldReduceMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : containerVariants;

  const item = shouldReduceMotion
    ? {
        hidden: { opacity: 1 },
        visible: { opacity: 1 },
      }
    : itemVariants;

  return (
    <section
      id="home"
      className="relative flex min-h-[88svh] items-center overflow-hidden px-6 py-24 md:px-12"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-12 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/20 blur-[110px] md:left-2/3" />
        <div className="absolute bottom-8 left-0 h-64 w-64 rounded-full bg-cyan-500/10 blur-[100px]" />
      </div>

      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="mx-auto w-full max-w-6xl"
      >
        <motion.div variants={item} className="mb-8">
          <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
            Frontend developer · Open to opportunities
          </span>
        </motion.div>

        <motion.p
          variants={item}
          className="text-lg text-zinc-400 md:text-xl"
        >
          Hello, I&apos;m
        </motion.p>

        <motion.h1
          variants={item}
          className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.08] tracking-tight sm:text-6xl md:text-8xl"
        >
          Sachin
          <br />
          <span className="gradient-text">Deshpande.</span>
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-7 max-w-2xl text-lg leading-8 text-zinc-400 md:text-xl"
        >
          I build scalable, accessible and high-performance web
          experiences using React, Next.js and TypeScript.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/projects"
            className="group inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-medium text-black transition hover:bg-violet-100"
          >
            Explore my work
            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

          <Link
            href="/contact"
            className="glass-panel rounded-xl px-6 py-3 font-medium text-white transition hover:bg-white/10"
          >
            Let&apos;s talk
          </Link>
        </motion.div>

        <motion.div
  variants={item}
  className="mt-12 flex items-center gap-5 text-zinc-400"
>
<a
  href="https://github.com/YOUR_GITHUB_USERNAME"
  target="_blank"
  rel="noopener noreferrer"
>
  GitHub ↗
</a>

<a
  href="https://www.linkedin.com/in/YOUR_LINKEDIN_USERNAME/"
  target="_blank"
  rel="noopener noreferrer"
>
  LinkedIn ↗
</a>

  <a
    href="#about"
    className="ml-auto inline-flex items-center gap-2 text-sm hover:text-white"
  >
    Scroll to explore
    <ArrowDown size={16} />
  </a>
</motion.div>
      </motion.div>
    </section>
  );
}
