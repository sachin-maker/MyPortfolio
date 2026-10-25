
"use client";

import { useState } from "react";

type EducationEntry = {
  _id: string;
  qualification: string;
  institution: string;
  fieldOfStudy?: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  isCurrent: boolean;
  grade?: string;
  description?: string;
  order: number;
  isPublished: boolean;
};

type EducationForm = {
  qualification: string;
  institution: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  grade: string;
  description: string;
  order: number;
  isPublished: boolean;
};

const emptyForm: EducationForm = {
  qualification: "",
  institution: "",
  fieldOfStudy: "",
  location: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  grade: "",
  description: "",
  order: 0,
  isPublished: true,
};

const inputClass =
  "mt-2 w-full rounded-xl border border-white/10 bg-[#11111b] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-violet-400/60";

const labelClass = "block text-sm font-medium text-zinc-300";

export default function EducationManager({
  initialEducation,
}: {
  initialEducation: EducationEntry[];
}) {
  const [education, setEducation] = useState(initialEducation);
  const [form, setForm] = useState<EducationForm>({ ...emptyForm });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField<K extends keyof EducationForm>(
    field: K,
    value: EducationForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
  }

  async function loadEducation() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/education", {
        cache: "no-store",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load education.");
      }

      const items = Array.isArray(result)
        ? result
        : result.education ?? result.data;

      if (!Array.isArray(items)) {
        throw new Error("Unexpected response from the Education API.");
      }

      setEducation(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load education."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleEdit(item: EducationEntry) {
    setError("");
    setMessage("");
    setEditingId(item._id);

    setForm({
      qualification: item.qualification,
      institution: item.institution,
      fieldOfStudy: item.fieldOfStudy ?? "",
      location: item.location ?? "",
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate?.slice(0, 10) ?? "",
      isCurrent: item.isCurrent,
      grade: item.grade ?? "",
      description: item.description ?? "",
      order: item.order ?? 0,
      isPublished: item.isPublished,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    if (form.isCurrent && form.endDate) {
      setError("An ongoing qualification must not have an end date.");
      setSaving(false);
      return;
    }

    if (
      !form.isCurrent &&
      form.endDate &&
      form.startDate &&
      form.endDate < form.startDate
    ) {
      setError("The end date cannot be earlier than the start date.");
      setSaving(false);
      return;
    }

    const payload = {
      ...form,
      startDate: form.startDate,
      endDate: form.isCurrent || !form.endDate ? null : form.endDate,
      fieldOfStudy: form.fieldOfStudy.trim(),
      location: form.location.trim(),
      grade: form.grade.trim(),
      description: form.description.trim(),
    };

    try {
      const response = await fetch(
        editingId ? `/api/education/${editingId}` : "/api/education",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save education.");
      }

      setMessage(editingId ? "Education updated." : "Education created.");
      resetForm();
      await loadEducation();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save education."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this education entry?")) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/education/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete education.");
      }

      if (editingId === id) resetForm();

      setMessage("Education deleted.");
      await loadEducation();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete education."
      );
    }
  }

  async function togglePublished(item: EducationEntry) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/education/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !item.isPublished }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update publish status.");
      }

      setMessage(
        item.isPublished
          ? "Education unpublished."
          : "Education published."
      );

      await loadEducation();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update publish status."
      );
    }
  }

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 md:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {editingId ? "Edit education" : "Add education"}
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Manage your academic qualifications and study details.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
            >
              Cancel editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className={labelClass}>
              Qualification *
              <input
                required
                maxLength={160}
                className={inputClass}
                placeholder="Bachelor of Engineering"
                value={form.qualification}
                onChange={(e) => updateField("qualification", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Institution *
              <input
                required
                maxLength={160}
                className={inputClass}
                placeholder="University or college name"
                value={form.institution}
                onChange={(e) => updateField("institution", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Field of study
              <input
                maxLength={160}
                className={inputClass}
                placeholder="Computer Science"
                value={form.fieldOfStudy}
                onChange={(e) => updateField("fieldOfStudy", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Location
              <input
                maxLength={160}
                className={inputClass}
                placeholder="Nagpur, Maharashtra"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Start date *
              <input
                required
                type="date"
                className={inputClass}
                value={form.startDate}
                onChange={(e) => updateField("startDate", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              End date
              <input
                type="date"
                disabled={form.isCurrent}
                className={inputClass}
                value={form.endDate}
                onChange={(e) => updateField("endDate", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Grade / CGPA
              <input
                maxLength={80}
                className={inputClass}
                placeholder="8.2 CGPA or 78%"
                value={form.grade}
                onChange={(e) => updateField("grade", e.target.value)}
              />
            </label>

            <label className={labelClass}>
              Display order
              <input
                type="number"
                step="1"
                className={inputClass}
                value={form.order}
                onChange={(e) =>
                  updateField("order", Number(e.target.value))
                }
              />
            </label>
          </div>

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isCurrent}
              onChange={(e) => {
                const checked = e.target.checked;
                setForm((current) => ({
                  ...current,
                  isCurrent: checked,
                  endDate: checked ? "" : current.endDate,
                }));
              }}
              className="h-4 w-4 accent-violet-500"
            />
            Currently studying here
          </label>

          <label className="block text-sm font-medium text-zinc-300">
            Description
            <textarea
              rows={4}
              maxLength={3000}
              className={inputClass}
              placeholder="Academic achievements, coursework, or other details..."
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </label>

          <label className="flex items-center gap-3 text-sm text-zinc-300">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => updateField("isPublished", e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
            Publish on public portfolio
          </label>

          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-sm text-emerald-300">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update education"
                : "Create education"}
          </button>
        </form>
      </section>

      <section>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Education entries</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {education.length} total{" "}
              {education.length === 1 ? "entry" : "entries"}
            </p>
          </div>

          <button
            type="button"
            onClick={loadEducation}
            disabled={loading}
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-violet-400/30 hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {education.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-zinc-500">
            No education entries yet. Add your first qualification above.
          </div>
        ) : (
          <div className="space-y-4">
            {education.map((item) => (
              <article
                key={item._id}
                className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">
                      {item.qualification}
                    </h3>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        item.isPublished
                          ? "bg-emerald-400/10 text-emerald-300"
                          : "bg-zinc-400/10 text-zinc-400"
                      }`}
                    >
                      {item.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {item.institution}
                    {item.fieldOfStudy ? ` · ${item.fieldOfStudy}` : ""}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    Order: {item.order}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-zinc-300 transition hover:bg-white/5"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    className="rounded-lg border border-violet-400/20 px-3 py-2 text-sm text-violet-300 transition hover:bg-violet-500/10"
                  >
                    {item.isPublished ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item._id)}
                    className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"
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
