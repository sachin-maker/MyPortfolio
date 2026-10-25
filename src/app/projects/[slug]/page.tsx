
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  ArrowLeft,
  ExternalLink,
  User,
  Layers3,
} from "lucide-react";

import connectDB from "@/app/lib/db";
import Project from "@/app/models/Project";

type ProjectDetailsPageProps = {
  params: Promise<{ slug: string }>;
};

async function ProjectDetails({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  await connection();

  let project;

  try {
    await connectDB();

    project = await Project.findOne({
      slug,
      status: "published",
    }).lean();
  } catch (error) {
    console.error("Failed to load project details:", error);
    throw error;
  }

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#09090f] px-6 py-12 text-white md:px-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300"
        >
          <ArrowLeft size={16} />
          Back to all projects
        </Link>

        <header className="mt-10">
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Project overview
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
            {project.title}
          </h1>

          <p className="mt-6 max-w-3xl text-base leading-8 text-zinc-400 md:text-lg">
            {project.description}
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400"
              >
                Live demo
                <ExternalLink size={16} />
              </a>
            )}

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-medium transition hover:border-violet-400/50 hover:bg-white/5"
              >
                <User size={16} />
                Source code
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </header>

        {project.image && (
          <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
            <img
              src={project.image}
              alt={`${project.title} project preview`}
              className="max-h-[600px] w-full object-cover"
            />
          </div>
        )}

        <section className="glass-panel mt-10 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Layers3 className="text-violet-300" size={22} />
            <h2 className="text-2xl font-semibold">
              Technology stack
            </h2>
          </div>

          {project.techStack.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-3">
              {project.techStack.map((technology: string) => (
                <span
                  key={technology}
                  className="rounded-full border border-violet-400/20 bg-violet-400/[0.08] px-4 py-2 text-sm text-violet-200"
                >
                  {technology}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-zinc-400">
              Technology details have not been added yet.
            </p>
          )}
        </section>

        <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-zinc-500">
          Built with care, performance, and user experience in mind.
        </footer>
      </div>
    </main>
  );
}


// type ProjectDetailsPageProps = {
//   params: Promise<{ slug: string }>;
// };

export default function ProjectDetailsPage({
  params,
}: ProjectDetailsPageProps) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#09090f] px-6 py-20 text-white">
          <div className="mx-auto max-w-5xl animate-pulse">
            <div className="h-4 w-36 rounded bg-white/10" />
            <div className="mt-10 h-12 max-w-lg rounded bg-white/10" />
            <div className="mt-6 h-24 max-w-3xl rounded bg-white/10" />
            <div className="mt-12 aspect-video rounded-2xl bg-white/5" />
          </div>
        </main>
      }
    >
      <ProjectDetails params={params} />
    </Suspense>
  );
}
