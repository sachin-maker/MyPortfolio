
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Experience from "@/app/models/Experience";
import ScrollReveal from "./scroll-reveal";

function formatDate(date: Date | string | null | undefined) {
    if (!date) return "Present";

    return new Date(date).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
}

export default async function ExperienceSection() {
    await connection();

    let experiences: {
        _id: unknown;
        role: string;
        company: string;
        location?: string;
        employmentType?: string;
        startDate: Date;
        endDate?: Date | null;
        isCurrent?: boolean;
        description: string;
        responsibilities?: string[];
        techStack?: string[];
    }[] = [];

    let hasError = false;

    try {
        await connectDB();

        experiences = await Experience.find({ isPublished: true })
            .sort({ order: 1, startDate: -1 })
            .select(
                "role company location employmentType startDate endDate isCurrent description responsibilities techStack"
            )
            .lean();
    } catch (error) {
        console.error("Failed to load experience:", error);
        hasError = true;
    }

    return (
        <section
            id="experience"
            className="border-y border-white/[0.06] px-6 py-24 md:px-12"
        >
            <div className="mx-auto max-w-6xl">
                <ScrollReveal>
                    <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
                        Experience
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
                        Engineering with impact
                    </h2>
                </ScrollReveal>

                {hasError ? (
                    <p className="mt-10 text-sm text-zinc-400">
                        Experience is temporarily unavailable.
                    </p>
                ) : experiences.length === 0 ? (
                    <p className="mt-10 text-sm text-zinc-400">
                        No experience entries have been added yet.
                    </p>
                ) : (

                    <div className="relative mt-12 space-y-8 before:absolute before:bottom-4 before:left-[15px] before:top-4 before:w-px before:bg-gradient-to-b before:from-violet-400/70 before:via-violet-400/20 before:to-transparent md:before:left-[19px]">
                        {experiences.map((item, index) => (
                            <ScrollReveal key={String(item._id)} delay={index * 0.12}>
                                <div className="relative pl-10 md:pl-14">
                                    <span className="absolute left-[9px] top-7 z-10 size-3.5 rounded-full border-2 border-violet-300 bg-[#09090f] shadow-[0_0_18px_rgba(167,139,250,0.5)] md:left-[13px] md:size-4" />

                                    <article className="glass-panel rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-violet-400/30 md:p-8">
                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <h3 className="text-xl font-semibold transition-colors group-hover:text-violet-200 md:text-2xl">
                                                    {item.role}
                                                </h3>

                                                <p className="mt-2 text-zinc-400">
                                                    {item.company}
                                                    {item.location ? ` · ${item.location}` : ""}
                                                </p>

                                                {item.employmentType && (
                                                    <span className="mt-3 inline-flex rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-400">
                                                        {item.employmentType}
                                                    </span>
                                                )}
                                            </div>

                                            <span className="rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-xs text-violet-300">
                                                {formatDate(item.startDate)} –{" "}
                                                {item.isCurrent
                                                    ? "Present"
                                                    : formatDate(item.endDate)}
                                            </span>
                                        </div>

                                        <p className="mt-5 max-w-3xl whitespace-pre-line leading-7 text-zinc-400">
                                            {item.description}
                                        </p>

                                        {item.responsibilities &&
                                            item.responsibilities.length > 0 && (
                                                <ul className="mt-5 space-y-3">
                                                    {item.responsibilities.map((responsibility) => (
                                                        <li
                                                            key={responsibility}
                                                            className="flex items-start gap-3 text-sm leading-6 text-zinc-400"
                                                        >
                                                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-violet-300" />
                                                            <span>{responsibility}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}

                                        {item.techStack && item.techStack.length > 0 && (
                                            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.08] pt-5">
                                                {item.techStack.map((technology) => (
                                                    <span
                                                        key={technology}
                                                        className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-300 transition hover:border-violet-400/30 hover:text-violet-200"
                                                    >
                                                        {technology}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                )}
            </div>
        </section>
    );
}
