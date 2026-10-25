
import { Suspense } from "react";
import { auth, signOut } from "@/auth";
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Project from "@/app/models/Project";
import Skill from "@/app/models/Skill";
import Experience from "@/app/models/Experience";
import Education from "@/app/models/Education";

const sections = [
  {
    title: "Projects",
    description: "Manage portfolio projects and publication status.",
    href: "/admin/projects",
    icon: "01",
  },
  {
    title: "Skills",
    description: "Organize technical skills and proficiency.",
    href: "/admin/skills",
    icon: "02",
  },
  {
    title: "Experience",
    description: "Manage roles, responsibilities, and technologies.",
    href: "/admin/experience",
    icon: "03",
  },
  {
    title: "Education",
    description: "Manage qualifications and academic details.",
    href: "/admin/education",
    icon: "04",
  },
];

async function AdminDashboardContent() {
  await connection();

  const session = await auth();

  let counts = {
    projects: 0,
    skills: 0,
    experience: 0,
    education: 0,
  };

  let databaseError = false;

  try {
    await connectDB();

    const [projects, skills, experience, education] =
      await Promise.all([
        Project.countDocuments(),
        Skill.countDocuments(),
        Experience.countDocuments(),
        Education.countDocuments(),
      ]);

    counts = { projects, skills, experience, education };
  } catch (error) {
    console.error("Failed to load dashboard counts:", error);
    databaseError = true;
  }

  const countByTitle: Record<string, number> = {
    Projects: counts.projects,
    Skills: counts.skills,
    Experience: counts.experience,
    Education: counts.education,
  };

  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm tracking-[0.3em] text-violet-300">
              PORTFOLIO CMS
            </p>
            <h1 className="mt-2 text-3xl font-semibold md:text-4xl">
              Admin dashboard
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Manage your portfolio from one place.
            </p>
          </div>

          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm transition hover:bg-white/5"
            >
              Sign out
            </button>
          </form>
        </header>

        <section className="glass-panel mt-10 rounded-2xl p-6 md:p-8">
          <p className="text-sm text-zinc-400">Welcome back</p>
          <h2 className="mt-2 text-xl font-medium">
            {session?.user?.name ?? "Administrator"}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            Signed in as{" "}
            {session?.user?.email ?? "Administrator"}.
          </p>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-violet-300">
                Content overview
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Your portfolio content
              </h2>
            </div>
            <p className="text-sm text-zinc-500">
              Total records across all collections
            </p>
          </div>

          {databaseError && (
            <p className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
              Could not load database counts. Check your database
              connection and try refreshing.
            </p>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <a
                key={section.title}
                href={section.href}
                className="glass-panel group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-violet-400/40"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.2em] text-violet-300">
                    {section.icon}
                  </span>
                  <span className="text-zinc-500 transition group-hover:text-violet-300">
                    ↗
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold">
                  {countByTitle[section.title]}
                </p>
                <h3 className="mt-2 font-medium">{section.title}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {section.description}
                </p>
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-6 py-12 md:px-12">
          <div className="mx-auto max-w-6xl">
            <p className="text-sm text-violet-300">PORTFOLIO CMS</p>
            <h1 className="mt-2 text-3xl font-semibold">
              Admin dashboard
            </h1>
            <p className="mt-6 text-sm text-zinc-400">
              Loading your dashboard...
            </p>
          </div>
        </main>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
