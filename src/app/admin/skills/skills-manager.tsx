
"use client";

import { useState, type FormEvent } from "react";

type SkillRecord = {
  _id: string;
  name: string;
  category: string;
  proficiency: number | null;
  icon: string;
  order: number;
  isActive: boolean;
};

type SkillForm = {
  name: string;
  category: string;
  proficiency: string;
  icon: string;
  order: number;
  isActive: boolean;
};

const emptyForm: SkillForm = {
  name: "",
  category: "Frontend",
  proficiency: "",
  icon: "",
  order: 0,
  isActive: true,
};

export default function SkillsManager({
  initialSkills,
}: {
  initialSkills: SkillRecord[];
}) {
  const [skills, setSkills] = useState(initialSkills);
  const [form, setForm] = useState<SkillForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  function editSkill(skill: SkillRecord) {
    setEditingId(skill._id);
    setForm({
      name: skill.name,
      category: skill.category,
      proficiency: skill.proficiency == null
        ? ""
        : String(skill.proficiency),
      icon: skill.icon,
      order: skill.order,
      isActive: skill.isActive,
    });
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const proficiency =
      form.proficiency.trim() === ""
        ? null
        : Number(form.proficiency);

    if (
      proficiency !== null &&
      (!Number.isFinite(proficiency) ||
        proficiency < 0 ||
        proficiency > 100)
    ) {
      setMessage("Proficiency must be between 0 and 100.");
      setSaving(false);
      return;
    }

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      proficiency,
      icon: form.icon.trim(),
      order: form.order,
      isActive: form.isActive,
    };

    try {
      const response = await fetch(
        editingId ? `/api/skills/${editingId}` : "/api/skills",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Could not save skill");
      }

      const saved = { ...result, _id: String(result._id) } as SkillRecord;

      if (editingId) {
        setSkills((current) =>
          current.map((skill) =>
            skill._id === editingId ? saved : skill
          )
        );
        setMessage("Skill updated successfully.");
      } else {
        setSkills((current) => [...current, saved]);
        setMessage("Skill created successfully.");
      }

      setForm(emptyForm);
      setEditingId(null);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(skill: SkillRecord) {
    setMessage("");

    try {
      const response = await fetch(`/api/skills/${skill._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !skill.isActive }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Could not update skill");
      }

      const updated = { ...result, _id: String(result._id) } as SkillRecord;

      setSkills((current) =>
        current.map((item) => item._id === skill._id ? updated : item)
      );
      setMessage("Skill status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  async function deleteSkill(skill: SkillRecord) {
    if (!window.confirm(`Delete "${skill.name}" permanently?`)) return;

    setMessage("");

    try {
      const response = await fetch(`/api/skills/${skill._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message ?? "Could not delete skill");
      }

      setSkills((current) =>
        current.filter((item) => item._id !== skill._id)
      );

      if (editingId === skill._id) resetForm();

      setMessage("Skill deleted successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong"
      );
    }
  }

  return (
    <div>
      <a
        href="/admin"
        className="text-sm text-violet-300 hover:text-violet-200"
      >
        ← Dashboard
      </a>

      <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
        Manage skills
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        Organize technologies by category and control which appear publicly.
      </p>

      <section className="glass-panel mt-8 rounded-2xl p-6 md:p-8">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit skill" : "Add a skill"}
        </h2>

        <form onSubmit={submitForm} className="mt-6 space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-zinc-300">
              Skill name *
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Category *
              <input
                required
                maxLength={80}
                value={form.category}
                onChange={(event) =>
                  setForm({ ...form, category: event.target.value })
                }
                placeholder="Frontend, Backend, Tools..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Proficiency (0–100, optional)
              <input
                type="number"
                min={0}
                max={100}
                value={form.proficiency}
                onChange={(event) =>
                  setForm({ ...form, proficiency: event.target.value })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Icon name (optional)
              <input
                maxLength={100}
                value={form.icon}
                onChange={(event) =>
                  setForm({ ...form, icon: event.target.value })
                }
                placeholder="react, typescript..."
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
              />
            </label>

            <label className="text-sm text-zinc-300">
              Display order
              <input
                type="number"
                step={1}
                value={form.order}
                onChange={(event) =>
                  setForm({ ...form, order: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) =>
                setForm({ ...form, isActive: event.target.checked })
              }
              className="accent-violet-400"
            />
            Active — display this skill publicly
          </label>

          {message && (
            <p role="status" className="text-sm text-violet-300">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white hover:bg-violet-400 disabled:opacity-50"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Create skill"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">
          All skills ({skills.length})
        </h2>

        {skills.length === 0 ? (
          <p className="mt-5 text-sm text-zinc-400">
            No skills yet. Add your first skill above.
          </p>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {skills.map((skill) => (
              <article
                key={skill._id}
                className="glass-panel rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {skill.category}
                    </p>
                  </div>

                  <span
                    className={`rounded-full border px-2.5 py-1 text-xs ${
                      skill.isActive
                        ? "border-emerald-400/20 text-emerald-300"
                        : "border-amber-400/20 text-amber-300"
                    }`}
                  >
                    {skill.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {skill.proficiency != null && (
                  <p className="mt-3 text-sm text-violet-300">
                    Proficiency: {skill.proficiency}%
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => editSkill(skill)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleActive(skill)}
                    className="rounded-lg border border-violet-400/20 px-3 py-2 text-sm text-violet-300 hover:bg-violet-400/10"
                  >
                    {skill.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    type="button"
                    onClick={() => deleteSkill(skill)}
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
