
import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Education from "@/app/models/Education";
import EducationManager from "./education-manager";

type EducationRecord = {
  _id: string;
  qualification: string;
  institution: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  order: number;
  isPublished: boolean;
};

async function EducationContent() {
  await connection();

  let education: EducationRecord[] = [];
  let hasError = false;

  try {
    await connectDB();

    const documents = await Education.find({})
      .sort({ order: 1, startDate: -1 })
      .lean();

    education = documents.map((item) => ({
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
    })) as EducationRecord[];
  } catch (error) {
    console.error("Failed to load admin education entries:", error);
    hasError = true;
  }

  if (hasError) {
    return (
      <p className="mt-6 text-sm text-red-300">
        Failed to load education entries. Check the database connection
        and server logs.
      </p>
    );
  }

  return <EducationManager initialEducation={education} />;
}

export default function EducationPage() {
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
            Manage Education
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Manage academic qualifications, study periods, grades,
            and publication status.
          </p>
        </div>

        <Suspense
          fallback={
            <p className="mt-10 text-sm text-zinc-400">
              Loading education entries...
            </p>
          }
        >
          <EducationContent />
        </Suspense>
      </div>
    </main>
  );
}
