
import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";
import Link from "next/link";

import connectDB from "../lib/db";
import Project from "../models/Project";
import ScrollReveal from "../components/portfolio/scroll-reveal";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected projects and frontend engineering work.",
};

async function ProjectsContent() {
  // Keep connection() outside try/catch so Next.js can handle
  // its prerendering suspension correctly.
  await connection();

  let projects;

  try {
    await connectDB();

    projects = await Project.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .lean();
  } catch (error) {
    console.error("Failed to load projects:", error);

    return (
      <main className="mx-auto min-h-[80vh] max-w-6xl px-6 py-24 md:px-12">
        <h1 className="text-4xl font-semibold md:text-6xl">
          Selected projects
        </h1>

        <p className="mt-5 text-zinc-400">
          Projects are temporarily unavailable. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-[80vh] max-w-6xl px-6 py-24 md:px-12">
      <ScrollReveal>
        <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
          Portfolio
        </p>

        <h1 className="mt-4 text-4xl font-semibold md:text-6xl">
          Selected projects
        </h1>

        <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
          A collection of projects showcasing frontend engineering,
          full-stack development, and thoughtful user experiences.
        </p>
      </ScrollReveal>

      {projects.length === 0 ? (
        <p className="mt-12 text-zinc-400">
          No published projects yet. Check back soon!
        </p>
      ) : (
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <ScrollReveal
              key={project._id.toString()}
              delay={(index % 3) * 0.1}
            >
              <article className="glass-panel group h-full overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/30">
                {project.image && (
                  <Link
                    href={`/projects/${project.slug}`}
                    aria-label={`View ${project.title} project details`}
                    className="block overflow-hidden border-b border-white/[0.06] bg-white/[0.03]"
                  >
                    <div className="aspect-video">
                      <img
                        src={project.image}
                        alt={`${project.title} project preview`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>
                )}

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-violet-300">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="text-xs text-zinc-500">
                      {project.featured ? "Featured" : "Project"}
                    </span>
                  </div>

                  <h2 className="mt-8 text-2xl font-semibold transition group-hover:text-violet-200">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="focus-visible:outline-2 focus-visible:outline-violet-400"
                    >
                      {project.title}
                    </Link>
                  </h2>

                  <p className="mt-4 min-h-24 leading-7 text-zinc-400">
                    {project.description}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {project.techStack.map((technology: string) => (
                      <span
                        key={technology}
                        className="rounded-lg border border-white/10 px-2.5 py-1 text-xs text-zinc-400"
                      >
                        {technology}
                      </span>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-sm">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="font-medium text-violet-300 hover:text-violet-200"
                    >
                      View project →
                    </Link>

                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-white"
                      >
                        Live demo ↗
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-300 hover:text-white"
                      >
                        Source code ↗
                      </a>
                    )}
                  </div>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
      )}
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-[80vh] max-w-6xl px-6 py-24 md:px-12">
          <p className="text-zinc-400">Loading projects...</p>
        </main>
      }
    >
      <ProjectsContent />
    </Suspense>
  );
}
