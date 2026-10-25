
import Link from "next/link";
import { connection } from "next/server";

import connectDB from "../../lib/db";
import Project from "../../models/Project";
import ScrollReveal from "./scroll-reveal";

async function FeaturedProjectsContent() {
  // Do not catch this call: Next.js uses it to suspend prerendering.
  await connection();

  let projects;

  try {
    await connectDB();

    projects = await Project.find({ status: "published" })
      .sort({ order: 1, createdAt: -1 })
      .limit(3)
      .lean();
  } catch (error) {
    console.error("Failed to load featured projects:", error);

    return (
      <section
        id="projects"
        className="px-6 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-semibold md:text-5xl">
            Projects that solve problems
          </h2>

          <p className="mt-6 text-zinc-400">
            Projects are temporarily unavailable. Please try again later.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="projects"
      className="px-6 py-24 md:px-12 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <ScrollReveal>
          <p className="text-sm uppercase tracking-[0.3em] text-violet-300">
            Selected work
          </p>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-5">
            <h2 className="text-3xl font-semibold md:text-5xl">
              Projects that solve problems
            </h2>

            <Link
              href="/projects"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              View all projects ↗
            </Link>
          </div>
        </ScrollReveal>

        {projects.length === 0 ? (
          <p className="mt-12 text-zinc-400">
            No published projects yet.
          </p>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ScrollReveal
                key={project._id.toString()}
                delay={index * 0.1}
              >
                <article className="glass-panel group h-full overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-violet-400/30">
                  {project.image && (
                    <div className="aspect-video overflow-hidden border-b border-white/[0.06] bg-white/[0.03]">
                      <img
                        src={project.image}
                        alt={`${project.title} project thumbnail`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-violet-300">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="text-xs text-zinc-500">
                        {project.featured
                          ? "Featured project"
                          : "Project"}
                      </span>
                    </div>

                    <h3 className="mt-10 text-2xl font-semibold transition group-hover:text-violet-200">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="focus-visible:outline-2 focus-visible:outline-violet-400"
                      >
                        {project.title}
                      </Link>
                    </h3>

                    <p className="mt-4 min-h-24 leading-7 text-zinc-400">
                      {project.description}
                    </p>

                    <p className="mt-6 border-t border-white/10 pt-5 text-xs leading-6 text-zinc-500">
                      {project.techStack.join(" · ")}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-4 text-sm">
                      {project.liveUrl && (
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-violet-300 hover:text-violet-200"
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
      </div>
    </section>
  );
}

export default function FeaturedProjects() {
  return <FeaturedProjectsContent />;
}
