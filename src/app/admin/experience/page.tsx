
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Experience from "@/app/models/Experience";
import ExperienceManager from "./experience-manager";

async function ExperienceContent() {
  await connection();

  let experiences;

  try {
    await connectDB();

    const documents = await Experience.find({})
      .sort({ order: 1, startDate: -1 })
      .lean();

    experiences = documents.map((item) => ({
      ...item,
      _id: item._id.toString(),
      startDate:
        item.startDate instanceof Date
          ? item.startDate.toISOString()
          : String(item.startDate),
      endDate: item.endDate
        ? item.endDate instanceof Date
          ? item.endDate.toISOString()
          : String(item.endDate)
        : null,
    }));
  } catch (error) {
    console.error("Failed to load admin experience entries:", error);

    return (
      <p className="mt-6 text-sm text-red-300">
        Failed to load experience entries. Check the database connection
        and server logs.
      </p>
    );
  }

  return <ExperienceManager initialExperiences={experiences} />;
}

export default function ExperiencePage() {
  return (
    <main className="min-h-screen bg-[#09090f] px-6 py-10 text-white md:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="text-sm text-zinc-400 transition hover:text-violet-300"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Portfolio CMS
          </p>
          <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
            Manage Experience
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Manage your roles, responsibilities, technologies, and
            publication status.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="mt-10 text-sm text-zinc-400">
              Loading experience entries...
            </p>
          }
        >
          <ExperienceContent />
        </Suspense>
      </div>
    </main>
  );
}
