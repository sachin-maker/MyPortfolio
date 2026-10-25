
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Education from "@/app/models/Education";
import ScrollReveal from "./scroll-reveal";
import { GraduationCap, MapPin, Award } from "lucide-react";

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "Present";

  return new Date(date).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export default async function EducationSection() {
  await connection();

  let education: {
    _id: unknown;
    qualification: string;
    institution: string;
    fieldOfStudy?: string;
    location?: string;
    startDate: Date;
    endDate?: Date | null;
    isCurrent?: boolean;
    grade?: string;
    description?: string;
  }[] = [];

  let hasError = false;

  try {
    await connectDB();

    education = await Education.find({ isPublished: true })
      .sort({ order: 1, startDate: -1 })
      .select(
        "qualification institution fieldOfStudy location startDate endDate isCurrent grade description"
      )
      .lean();
  } catch (error) {
    console.error("Failed to load education:", error);
    hasError = true;
  }

  return (
    <section
      id="education"
      className="border-y border-white/[0.06] px-6 py-24 md:px-12"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Education
          </p>
          <h2 className="mt-4 text-3xl font-semibold md:text-5xl">
            Learning and growth
          </h2>
        </ScrollReveal>

        {hasError ? (
          <p className="mt-10 text-sm text-zinc-400">
            Education is temporarily unavailable.
          </p>
        ) : education.length === 0 ? (
          <p className="mt-10 text-sm text-zinc-400">
            No education entries have been added yet.
          </p>
        ) : (

<div className="relative mt-12 space-y-6 before:absolute before:bottom-6 before:left-5 before:top-6 before:w-px before:bg-gradient-to-b before:from-violet-400/60 before:via-violet-500/20 before:to-transparent md:ml-4">
  {education.map((item, index) => (
    <ScrollReveal key={String(item._id)} delay={index * 0.12}>
      <article className="group relative ml-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition duration-300 hover:border-violet-400/30 hover:bg-white/[0.045] hover:shadow-[0_12px_40px_rgba(139,92,246,0.07)] md:ml-8 md:p-8">
        <span className="absolute -left-[1.9rem] top-8 flex h-4 w-4 items-center justify-center rounded-full border-2 border-violet-400 bg-[#09090f] shadow-[0_0_14px_rgba(167,139,250,0.35)] md:-left-[2.8rem]">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-300" />
        </span>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10 text-violet-300 transition group-hover:bg-violet-500/15">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <h3 className="text-xl font-semibold text-white transition group-hover:text-violet-100 md:text-2xl">
                {item.qualification}
              </h3>

              <p className="mt-2 font-medium text-zinc-300">
                {item.institution}
              </p>

              {item.fieldOfStudy && (
                <p className="mt-1 text-sm text-zinc-400">
                  {item.fieldOfStudy}
                </p>
              )}

              {item.location && (
                <p className="mt-2 flex items-center gap-1.5 text-sm text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                  {item.location}
                </p>
              )}
            </div>
          </div>

          <span className="w-fit shrink-0 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-3 py-1.5 text-xs font-medium text-violet-300">
            {formatDate(item.startDate)} –{" "}
            {item.isCurrent ? "Present" : formatDate(item.endDate)}
          </span>
        </div>

        {item.grade && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-3 py-2 text-sm text-zinc-300">
            <Award className="h-4 w-4 text-violet-300" aria-hidden="true" />
            <span className="text-zinc-500">Grade</span>
            <span className="font-medium text-violet-200">
              {item.grade}
            </span>
          </div>
        )}

        {item.description && (
          <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-zinc-400 md:text-base">
            {item.description}
          </p>
        )}
      </article>
    </ScrollReveal>
  ))}
</div>

        )}
      </div>
    </section>
  );
}
