
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Skill from "@/app/models/Skill";
import ScrollReveal from "./scroll-reveal";
import type { SimpleIcon } from "simple-icons";

import {
    siReact,
    siNextdotjs,
    siTypescript,
    siJavascript,
    siNodedotjs,
    siExpress,
    siMongodb,
    siRedux,
    siTailwindcss,
    siGit,
    siGithub,
    siHtml5,
    siCss,
    siWebpack,
    siJest,
    siPostgresql,
    siMysql,
    siDocker,

} from "simple-icons";


const CATEGORY_ORDER = [
  "Frontend",
  "Backend",
  "Database",
  "DevOps",
  "Testing",
  "Tools",
];




const skillIcons: Record<string, SimpleIcon> = {
    react: siReact,
    "react.js": siReact,
    nextjs: siNextdotjs,
    "next.js": siNextdotjs,
    typescript: siTypescript,
    javascript: siJavascript,
    "node.js": siNodedotjs,
    nodejs: siNodedotjs,
    express: siExpress,
    "express.js": siExpress,
    mongodb: siMongodb,
    redux: siRedux,
    "redux toolkit": siRedux,
    tailwind: siTailwindcss,
    "tailwind css": siTailwindcss,
    git: siGit,
    github: siGithub,
    html: siHtml5,
    html5: siHtml5,
    css: siCss,
    webpack: siWebpack,
    jest: siJest,
    postgresql: siPostgresql,
    mysql: siMysql,
    docker: siDocker,

};

function getSkillIcon(name: string): SimpleIcon | undefined {
    return skillIcons[name.trim().toLowerCase()];
}


export default async function SkillsSection() {
    await connection();

    let skills: {
        _id: unknown;
        name: string;
        category: string;
        proficiency?: number | null;
    }[] = [];

    let hasError = false;

    try {
        await connectDB();

        skills = await Skill.find({ isActive: true })
            .sort({ category: 1, order: 1, name: 1 })
            .select("name category proficiency")
            .lean();
    } catch (error) {
        console.error("Failed to load portfolio skills:", error);
        hasError = true;
    }

    const categories = Array.from(
        new Set(skills.map((skill) => skill.category))
    );

    const sortedCategories = [...categories].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a);
    const indexB = CATEGORY_ORDER.indexOf(b);

    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;

    return indexA - indexB;
});

    return (
        <section
            id="skills"
            className="relative overflow-hidden border-y border-white/[0.06] px-6 py-24 md:px-12"
        >
            <div className="pointer-events-none absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-violet-600/[0.08] blur-[120px]" />

            <div className="relative mx-auto max-w-6xl">
                <ScrollReveal>
                    <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                        Technologies
                    </p>

                    <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-5xl">
                        Tools I build with
                    </h2>

                    <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
                        Technologies and tools I use to build responsive,
                        scalable, and maintainable web experiences.
                    </p>
                </ScrollReveal>

                {hasError ? (
                    <p className="mt-10 text-sm text-zinc-400">
                        Skills are temporarily unavailable.
                    </p>
                ) : skills.length === 0 ? (
                    <p className="mt-10 text-sm text-zinc-400">
                        No skills have been added yet.
                    </p>
                ) : (
                    <div className="mt-12 space-y-12">
                        {sortedCategories.map((category, categoryIndex) => {
                            const categorySkills = skills.filter(
                                (skill) => skill.category === category
                            );

                            return (
                                <div key={category}>
                                    <ScrollReveal delay={categoryIndex * 0.08}>
                                        <div className="mb-5 flex items-center gap-3">
                                            <span className="h-5 w-1 rounded-full bg-violet-400" />
                                            <h3 className="text-lg font-medium text-zinc-200">
                                                {category}
                                            </h3>
                                            <span className="text-xs text-zinc-500">
                                                {String(categorySkills.length).padStart(2, "0")}
                                            </span>
                                        </div>
                                    </ScrollReveal>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {categorySkills.map((skill, index) => {
                                            const proficiency =
                                                skill.proficiency != null &&
                                                    Number.isFinite(skill.proficiency)
                                                    ? Math.min(100, Math.max(0, skill.proficiency))
                                                    : null;

                                            return (
                                                <ScrollReveal
                                                    key={String(skill._id)}
                                                    delay={(index % 3) * 0.06}
                                                >
                                                    <article className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(139,92,246,0.08)]">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 transition group-hover:border-violet-400/30 group-hover:bg-violet-500/15">
                                                                    {(() => {
                                                                        const icon = getSkillIcon(skill.name);

                                                                        if (!icon) {
                                                                            return (
                                                                                <span className="text-sm font-semibold text-violet-300">
                                                                                    {skill.name.slice(0, 2).toUpperCase()}
                                                                                </span>
                                                                            );
                                                                        }

                                                                        return (
                                                                            <svg
                                                                                viewBox="0 0 24 24"
                                                                                className="h-5 w-5"
                                                                                role="img"
                                                                                aria-label={`${skill.name} logo`}
                                                                            >
                                                                                <path
                                                                                    d={icon.path}
                                                                                    fill={`#${icon.hex}`}
                                                                                />
                                                                            </svg>
                                                                        );
                                                                    })()}
                                                                </span>

                                                                <h4 className="font-medium text-zinc-100">
                                                                    {skill.name}
                                                                </h4>
                                                            </div>

                                                            {proficiency !== null && (
                                                                <span className="text-xs tabular-nums text-violet-300">
                                                                    {proficiency}%
                                                                </span>
                                                            )}
                                                        </div>

                                                        {proficiency !== null && (
                                                            <div className="mt-5">
                                                                <div
                                                                    className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]"
                                                                    role="progressbar"
                                                                    aria-label={`${skill.name} proficiency`}
                                                                    aria-valuemin={0}
                                                                    aria-valuemax={100}
                                                                    aria-valuenow={proficiency}
                                                                >
                                                                    <div
                                                                        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400 transition-[width] duration-700 ease-out"
                                                                        style={{ width: `${proficiency}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </article>
                                                </ScrollReveal>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
