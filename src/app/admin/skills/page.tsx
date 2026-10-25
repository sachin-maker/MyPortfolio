
import { Suspense } from "react";
import { connection } from "next/server";
import connectDB from "@/app/lib/db";
import Skill from "@/app/models/Skill";
import SkillsManager from "./skills-manager";

async function SkillsContent() {
  await connection();
  await connectDB();

  const records = await Skill.find({})
    .sort({ category: 1, order: 1, name: 1 })
    .lean();

  const skills = records.map((skill) => ({
    _id: String(skill._id),
    name: skill.name,
    category: skill.category,
    proficiency: skill.proficiency ?? null,
    icon: skill.icon ?? "",
    order: skill.order,
    isActive: skill.isActive,
  }));

  return <SkillsManager initialSkills={skills} />;
}

export default function SkillsPage() {
  return (
    <main className="min-h-screen px-6 py-12 md:px-12">
      <div className="mx-auto max-w-6xl">
        <Suspense
          fallback={
            <p className="text-sm text-zinc-400">Loading skills...</p>
          }
        >
          <SkillsContent />
        </Suspense>
      </div>
    </main>
  );
}
