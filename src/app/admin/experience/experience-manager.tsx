
"use client";

import { useState, type FormEvent } from "react";

type Experience = {
  _id: string;
  role: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  responsibilities: string[];
  techStack: string[];
  order: number;
  isPublished: boolean;
};

type ExperienceForm = {
  role: string;
  company: string;
  location: string;
  employmentType: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  responsibilities: string;
  techStack: string;
  order: number;
  isPublished: boolean;
};

const emptyForm: ExperienceForm = {
  role: "",
  company: "",
  location: "",
  employmentType: "Full-time",
  startDate: "",
  endDate: "",
  isCurrent: false,
  description: "",
  responsibilities: "",
  techStack: "",
  order: 0,
  isPublished: false,
};

export default function ExperienceManager({
  initialExperiences,
}: {
  initialExperiences: Experience[];
}) {
  const [experiences, setExperiences] = useState(initialExperiences);
  const [form, setForm] = useState<ExperienceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");




async function loadExperiences() {
  setLoading(true);
  setMessage("");

  try {
    const response = await fetch("/api/experience", {
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to load experiences.");
    }

    const items = Array.isArray(result)
      ? result
      : result.experiences ?? result.data;

    if (!Array.isArray(items)) {
      throw new Error("Unexpected response from the Experience API.");
    }

    setExperiences(items);
  } catch (error) {
    setMessage(
      error instanceof Error
        ? error.message
        : "Failed to load experiences."
    );
  } finally {
    setLoading(false);
  }
}


  function startEditing(experience: Experience) {
    setEditingId(experience._id);
    setForm({
      role: experience.role,
      company: experience.company,
      location: experience.location ?? "",
      employmentType: experience.employmentType ?? "Full-time",
      startDate: experience.startDate?.slice(0, 10) ?? "",
      endDate: experience.endDate?.slice(0, 10) ?? "",
      isCurrent: experience.isCurrent,
      description: experience.description ?? "",
      responsibilities: (experience.responsibilities ?? []).join("\n"),
      techStack: (experience.techStack ?? []).join(", "),
      order: experience.order ?? 0,
      isPublished: experience.isPublished,
    });
    setMessage("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const payload = {
      ...form,
      endDate: form.isCurrent || !form.endDate ? null : form.endDate,
      responsibilities: form.responsibilities
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      techStack: form.techStack
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    };

    try {
      const response = await fetch(
        editingId ? `/api/experience/${editingId}` : "/api/experience",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save experience.");
      }

      setMessage(editingId ? "Experience updated." : "Experience created.");
      resetForm();
      await loadExperiences();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to save experience."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this experience entry permanently?")) return;

    setMessage("");

    try {
      const response = await fetch(`/api/experience/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete experience.");
      }

      setMessage("Experience deleted.");
      await loadExperiences();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to delete experience."
      );
    }
  }

  return (
    <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">Experience entries</h2>
          <button
            type="button"
            onClick={loadExperiences}
            disabled={loading}
            className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {experiences.length === 0 ? (
          <p className="rounded-xl border border-white/10 p-5 text-sm text-zinc-400">
            No experience entries yet. Add your first role using the form.
          </p>
        ) : (
          experiences.map((experience) => (
            <article
              key={experience._id}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{experience.role}</h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {experience.company}
                    {experience.location ? ` · ${experience.location}` : ""}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500">
                    {experience.startDate?.slice(0, 10)} —{" "}
                    {experience.isCurrent
                      ? "Present"
                      : experience.endDate?.slice(0, 10) || "Not specified"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs ${
                    experience.isPublished
                      ? "bg-emerald-400/10 text-emerald-300"
                      : "bg-amber-400/10 text-amber-300"
                  }`}
                >
                  {experience.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => startEditing(experience)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(experience._id)}
                  className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
        <h2 className="text-xl font-semibold">
          {editingId ? "Edit experience" : "Add experience"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm text-zinc-300">
              Job title *
              <input
                required
                maxLength={150}
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Company *
              <input
                required
                maxLength={150}
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Location
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              Employment type
              <select
                value={form.employmentType}
                onChange={(e) =>
                  setForm({ ...form, employmentType: e.target.value })
                }
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
                <option>Freelance</option>
              </select>
            </label>

            <label className="block text-sm text-zinc-300">
              Start date *
              <input
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
              />
            </label>

            <label className="block text-sm text-zinc-300">
              End date
              <input
                type="date"
                disabled={form.isCurrent}
                value={form.endDate}
                min={form.startDate || undefined}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400 disabled:opacity-40"
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) =>
                setForm({
                  ...form,
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? "" : form.endDate,
                })
              }
              className="accent-violet-400"
            />
            This is my current role
          </label>

          <label className="block text-sm text-zinc-300">
            Description *
            <textarea
              required
              maxLength={2000}
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Responsibilities
            <span className="mt-1 block text-xs text-zinc-500">
              Enter one responsibility per line.
            </span>
            <textarea
              rows={4}
              value={form.responsibilities}
              onChange={(e) =>
                setForm({ ...form, responsibilities: e.target.value })
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Technologies
            <span className="mt-1 block text-xs text-zinc-500">
              Separate technologies with commas.
            </span>
            <input
              value={form.techStack}
              onChange={(e) => setForm({ ...form, techStack: e.target.value })}
              placeholder="React, TypeScript, Redux"
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Display order
            <input
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm({ ...form, order: Number(e.target.value) || 0 })
              }
              className="mt-2 w-full rounded-lg border border-white/10 bg-[#09090f] px-3 py-2.5 text-white outline-none focus:border-violet-400"
            />
          </label>

          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) =>
                setForm({ ...form, isPublished: e.target.checked })
              }
              className="accent-violet-400"
            />
            Publish on public portfolio
          </label>

          {message && (
            <p role="status" className="text-sm text-violet-300">
              {message}
            </p>
          )}

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium hover:bg-violet-400 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Save changes"
                  : "Create experience"}
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
    </div>
  );
}
