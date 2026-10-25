
"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

type ProjectRecord = {
    _id: string;
    title: string;
    slug: string;
    description: string;
    techStack: string[];
    image: string;
    liveUrl: string;
    githubUrl: string;
    featured: boolean;
    status: "draft" | "published";
    order: number;
};

type ProjectForm = {
    title: string;
    slug: string;
    description: string;
    techStack: string;
    image: string;
    liveUrl: string;
    githubUrl: string;
    featured: boolean;
    status: "draft" | "published";
    order: number;
};

const emptyForm: ProjectForm = {
    title: "",
    slug: "",
    description: "",
    techStack: "",
    image: "",
    liveUrl: "",
    githubUrl: "",
    featured: false,
    status: "draft",
    order: 0,
};

export default function ProjectsManager({
    initialProjects,
}: {
    initialProjects: ProjectRecord[];
}) {
    const [projects, setProjects] = useState(initialProjects);
    const [form, setForm] = useState<ProjectForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const imageInputRef = useRef<HTMLInputElement>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadError, setUploadError] = useState("");

    function startEditing(project: ProjectRecord) {
        setEditingId(project._id);
        setForm({
            title: project.title,
            slug: project.slug,
            description: project.description,
            techStack: project.techStack.join(", "),
            image: project.image,
            liveUrl: project.liveUrl,
            githubUrl: project.githubUrl,
            featured: project.featured,
            status: project.status,
            order: project.order,
        });
        setMessage("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function resetForm() {
        setForm(emptyForm);
        setEditingId(null);
        setMessage("");
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        const payload = {
            ...form,
            techStack: form.techStack
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
        };

        try {
            const response = await fetch(
                editingId ? `/api/projects/${editingId}` : "/api/projects",
                {
                    method: editingId ? "PATCH" : "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? "Could not save project");
            }

            if (editingId) {
                setProjects((current) =>
                    current.map((project) =>
                        project._id === editingId ? result : project
                    )
                );
                setMessage("Project updated successfully.");
            } else {
                setProjects((current) => [
                    { ...result, _id: String(result._id) },
                    ...current,
                ]);
                setMessage("Project created successfully.");
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


    async function handleImageUpload(
        event: ChangeEvent<HTMLInputElement>
    )
    {
        const file = event.target.files?.[0];

        if (!file) return;

        setUploadingImage(true);
        setUploadError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/uploads/projects", {
                method: "POST",
                body: formData,
            });

            const result = (await response.json()) as {
                url?: string;
                message?: string;
            };

            if (!response.ok || !result.url) {
                throw new Error(result.message ?? "Image upload failed.");
            }

            // Update the image field in your existing project form state.
            setForm((current) => ({
                ...current,
                image: result.url!,
            }));
        } catch (error) {
            setUploadError(
                error instanceof Error ? error.message : "Image upload failed."
            );
        } finally {
            setUploadingImage(false);

            if (imageInputRef.current) {
                imageInputRef.current.value = "";
            }
        }
    }

    async function toggleStatus(project: ProjectRecord) {
        setMessage("");

        try {
            const response = await fetch(`/api/projects/${project._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: project.status === "published" ? "draft" : "published",
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? "Could not change status");
            }

            setProjects((current) =>
                current.map((item) => (item._id === project._id ? result : item))
            );
            setMessage("Project status updated.");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    }

    async function deleteProject(project: ProjectRecord) {
        if (!window.confirm(`Delete "${project.title}" permanently?`)) {
            return;
        }

        setMessage("");

        try {
            const response = await fetch(`/api/projects/${project._id}`, {
                method: "DELETE",
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? "Could not delete project");
            }

            setProjects((current) =>
                current.filter((item) => item._id !== project._id)
            );

            if (editingId === project._id) resetForm();

            setMessage("Project deleted successfully.");
        } catch (error) {
            setMessage(
                error instanceof Error ? error.message : "Something went wrong"
            );
        }
    }

    return (
        <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <a
                        href="/admin"
                        className="text-sm text-violet-300 hover:text-violet-200"
                    >
                        ← Dashboard
                    </a>
                    <h1 className="mt-3 text-3xl font-semibold md:text-4xl">
                        Manage projects
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Create, edit, publish, and organize your portfolio projects.
                    </p>
                </div>

                <span className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-300">
                    {projects.length} total
                </span>
            </div>

            <section className="glass-panel mt-8 rounded-2xl p-6 md:p-8">
                <h2 className="text-xl font-semibold">
                    {editingId ? "Edit project" : "Add a project"}
                </h2>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 md:grid-cols-2">
                        <label className="text-sm text-zinc-300">
                            Project title *
                            <input
                                required
                                maxLength={120}
                                value={form.title}
                                onChange={(event) =>
                                    setForm({ ...form, title: event.target.value })
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
                            />
                        </label>

                        <label className="text-sm text-zinc-300">
                            Slug *
                            <input
                                required
                                maxLength={120}
                                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                                placeholder="my-project"
                                value={form.slug}
                                onChange={(event) =>
                                    setForm({ ...form, slug: event.target.value })
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
                            />
                        </label>
                    </div>

                    <label className="block text-sm text-zinc-300">
                        Description *
                        <textarea
                            required
                            maxLength={2000}
                            rows={4}
                            value={form.description}
                            onChange={(event) =>
                                setForm({ ...form, description: event.target.value })
                            }
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
                        />
                    </label>

                    <label className="block text-sm text-zinc-300">
                        Technologies (comma-separated)
                        <input
                            value={form.techStack}
                            onChange={(event) =>
                                setForm({ ...form, techStack: event.target.value })
                            }
                            placeholder="Next.js, TypeScript, MongoDB"
                            className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
                        />
                    </label>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div className="space-y-3">
                            <label className="block text-sm text-zinc-300">
                                Project thumbnail
                            </label>

                            <input
                                ref={imageInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageUpload}
                                disabled={uploadingImage}
                                className="block w-full text-sm text-zinc-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-4 file:py-2 file:text-violet-200 disabled:opacity-50"
                            />

                            <p className="text-xs text-zinc-500">
                                JPEG, PNG, or WebP. Maximum size: 2 MB.
                            </p>

                            {uploadingImage && (
                                <p className="text-sm text-violet-300">Uploading image…</p>
                            )}

                            {uploadError && (
                                <p role="alert" className="text-sm text-red-400">
                                    {uploadError}
                                </p>
                            )}

                            {form.image && (
                                <div className="space-y-2">
                                    <img
                                        src={form.image}
                                        alt="Project thumbnail preview"
                                        className="h-40 w-full max-w-sm rounded-xl border border-white/10 object-cover"
                                    />

                                    <p className="break-all text-xs text-zinc-500">
                                        {form.image}
                                    </p>
                                </div>
                            )}
                        </div>

                        <label className="text-sm text-zinc-300">
                            Live website URL
                            <input
                                type="url"
                                value={form.liveUrl}
                                onChange={(event) =>
                                    setForm({ ...form, liveUrl: event.target.value })
                                }
                                className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-violet-400/60"
                            />
                        </label>

                        <label className="text-sm text-zinc-300">
                            GitHub URL
                            <input
                                type="url"
                                value={form.githubUrl}
                                onChange={(event) =>
                                    setForm({ ...form, githubUrl: event.target.value })
                                }
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

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <input
                                type="checkbox"
                                checked={form.featured}
                                onChange={(event) =>
                                    setForm({ ...form, featured: event.target.checked })
                                }
                                className="accent-violet-400"
                            />
                            Featured project
                        </label>

                        <label className="flex items-center gap-2 text-sm text-zinc-300">
                            <span>Status</span>
                            <select
                                value={form.status}
                                onChange={(event) =>
                                    setForm({
                                        ...form,
                                        status: event.target.value as "draft" | "published",
                                    })
                                }
                                className="rounded-lg border border-white/10 bg-[#17151f] px-3 py-2 text-white"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </label>
                    </div>

                    {message && (
                        <p role="status" className="text-sm text-violet-300">
                            {message}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-3">
                        <button
                            type="submit"
                            disabled={saving || uploadingImage}
                            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-50"
                        >
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Save changes"
                                    : "Create project"}
                        </button>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="rounded-xl border border-white/10 px-5 py-3 text-sm hover:bg-white/5"
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            <section className="mt-10">
                <h2 className="text-xl font-semibold">All projects</h2>

                {projects.length === 0 ? (
                    <p className="mt-5 text-sm text-zinc-400">
                        No projects found. Create your first project above.
                    </p>
                ) : (
                    <div className="mt-5 space-y-4">
                        {projects.map((project) => (
                            <article
                                key={project._id}
                                className="glass-panel rounded-2xl p-5 md:p-6"
                            >
                                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="text-lg font-semibold">
                                                {project.title}
                                            </h3>
                                            <span
                                                className={`rounded-full border px-3 py-1 text-xs ${project.status === "published"
                                                        ? "border-emerald-400/20 text-emerald-300"
                                                        : "border-amber-400/20 text-amber-300"
                                                    }`}
                                            >
                                                {project.status}
                                            </span>
                                            {project.featured && (
                                                <span className="rounded-full border border-violet-400/20 px-3 py-1 text-xs text-violet-300">
                                                    Featured
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-sm text-zinc-400">
                                            /{project.slug}
                                        </p>
                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">
                                            {project.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {project.techStack.map((technology) => (
                                                <span
                                                    key={technology}
                                                    className="rounded-lg border border-white/[0.08] px-2.5 py-1 text-xs text-zinc-300"
                                                >
                                                    {technology}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEditing(project)}
                                            className="rounded-lg border border-white/10 px-3 py-2 text-sm hover:bg-white/5"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => toggleStatus(project)}
                                            className="rounded-lg border border-violet-400/20 px-3 py-2 text-sm text-violet-300 hover:bg-violet-400/10"
                                        >
                                            {project.status === "published"
                                                ? "Unpublish"
                                                : "Publish"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => deleteProject(project)}
                                            className="rounded-lg border border-red-400/20 px-3 py-2 text-sm text-red-300 hover:bg-red-400/10"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
