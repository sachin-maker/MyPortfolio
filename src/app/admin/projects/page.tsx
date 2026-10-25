
import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Project from "@/app/models/Project";
import ProjectsManager from "./projects-manager";

async function ProjectsContent() {
  await connection();
  await connectDB();

  const records = await Project.find({})
    .sort({ order: 1, createdAt: -1 })
    .lean();

  const projects = records.map((project) => ({
    _id: String(project._id),
    title: project.title,
    slug: project.slug,
    description: project.description,
    techStack: project.techStack,
    image: project.image,
    liveUrl: project.liveUrl,
    githubUrl: project.githubUrl,
    featured: project.featured,
    status: project.status,
    order: project.order,
  }));

  return <ProjectsManager initialProjects={projects} />;
}

export default function ProjectsPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <p className="text-sm text-zinc-400">
              Loading projects...
            </p>
          }
        >
          <ProjectsContent />
        </Suspense>
      </div>
    </main>
  );
}
