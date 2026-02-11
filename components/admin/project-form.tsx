"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { slugify } from "@/lib/slug";
import type { ProjectSectionType } from "@/lib/project-model";
import type { ProjectFormState } from "@/app/admin/(protected)/projects/actions";

type FormMode = "create" | "edit";

export type ProjectFormInitial = {
  title: string;
  slug: string;
  description: string;
  category: string;
  technologies: string[];
  external: boolean;
  externalUrl?: string;
  published: boolean;
  sectionsJson: string;
};

export default function ProjectForm({
  mode,
  initial,
  action,
  submitLabel,
}: {
  mode: FormMode;
  initial: ProjectFormInitial;
  action: (prevState: ProjectFormState, formData: FormData) => Promise<ProjectFormState>;
  submitLabel: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [slug, setSlug] = useState(initial.slug);
  const [description, setDescription] = useState(initial.description);
  const [category, setCategory] = useState(initial.category);
  const [technologies, setTechnologies] = useState(initial.technologies.join(", "));
  const [external, setExternal] = useState(initial.external);
  const [externalUrl, setExternalUrl] = useState(initial.externalUrl || "");
  const [published, setPublished] = useState(initial.published);
  const [sections, setSections] = useState(initial.sectionsJson);
  const [state, formAction] = useFormState<ProjectFormState, FormData>(action, { ok: false });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const canAutofillSlug = useMemo(() => mode === "create", [mode]);

  function onTitleBlur() {
    if (!canAutofillSlug) return;
    if (slug.trim()) return;
    setSlug(slugify(title));
  }

  useEffect(() => {
    if (state.ok) {
      router.push("/admin/projects");
    }
  }, [router, state.ok]);

  return (
    <form action={formAction} className="space-y-6">
      {!state.ok && state.message && (
        <div className="border border-red-500/40 bg-red-500/10 text-red-200 rounded-lg p-3 text-sm whitespace-pre-wrap">
          {state.message}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-200" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={onTitleBlur}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-200" htmlFor="slug">
            Slug (kebab-case, used for routing)
          </label>
          <input
            id="slug"
            name="slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-gray-200" htmlFor="description">
          Description (keeps current “Problem | Role | Stack | Outcome” format)
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm text-gray-200" htmlFor="category">
            Category
          </label>
          <input
            id="category"
            name="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-200" htmlFor="technologies">
            Technologies (comma-separated)
          </label>
          <input
            id="technologies"
            name="technologies"
            value={technologies}
            onChange={(e) => setTechnologies(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6 items-center">
        <label className="flex items-center gap-2 text-gray-200 text-sm">
          <input
            type="checkbox"
            name="published"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Published
        </label>

        <label className="flex items-center gap-2 text-gray-200 text-sm">
          <input
            type="checkbox"
            name="external"
            checked={external}
            onChange={(e) => setExternal(e.target.checked)}
          />
          External (no detail page)
        </label>
      </div>

      {external && (
        <div className="space-y-1">
          <label className="text-sm text-gray-200" htmlFor="externalUrl">
            External URL
          </label>
          <input
            id="externalUrl"
            name="externalUrl"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://…"
            className="w-full px-3 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <label className="text-sm text-gray-200" htmlFor="sections">
            Sections (JSON array)
          </label>
          <span className="text-xs text-gray-400">
            Types: {(["text", "image", "video", "file", "game"] as ProjectSectionType[]).join(", ")}
          </span>
        </div>
        <textarea
          id="sections"
          name="sections"
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          rows={10}
          className="w-full font-mono text-xs px-3 py-2 rounded-lg bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400">
          This is validated on save. For example:{" "}
          <code className="text-gray-300">
            [{`{"type":"text","content":"..."}`},{" "}
            {`{"type":"file","src":"/foo.zip","description":"Download"}`}]{" "}
          </code>
        </p>
      </div>

      <div className="border border-white/10 rounded-xl p-4 bg-black/20 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Image upload helper</h3>
          <span className="text-xs text-gray-400">Uploads to Sanity assets (server-side)</span>
        </div>

        {uploadError && <div className="text-sm text-red-200 whitespace-pre-wrap">{uploadError}</div>}
        {uploadedUrl && (
          <div className="text-sm text-green-200">
            Uploaded:{" "}
            <a className="underline" href={uploadedUrl} target="_blank" rel="noreferrer">
              {uploadedUrl}
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/*"
            disabled={uploading}
            onChange={async (e) => {
              setUploadError(null);
              setUploadedUrl(null);
              const file = e.target.files?.[0];
              if (!file) return;

              setUploading(true);
              try {
                const fd = new FormData();
                fd.append("file", file);
                const res = await fetch("/api/admin/upload/image", { method: "POST", body: fd });
                const json = await res.json();
                if (!res.ok) throw new Error(json?.error || "Upload failed");
                setUploadedUrl(json.url);
              } catch (err: any) {
                setUploadError(err?.message || "Upload failed");
              } finally {
                setUploading(false);
                // allow re-upload of same file
                e.target.value = "";
              }
            }}
            className="text-sm text-gray-200"
          />
          {uploadedUrl && (
            <button
              type="button"
              className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
              onClick={() => {
                navigator.clipboard?.writeText(uploadedUrl);
              }}
            >
              Copy URL
            </button>
          )}
          <span className="text-xs text-gray-400">
            Use the returned URL as a section `src` for `type: "image"` in the JSON above.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        <a href="/admin/projects" className="text-sm text-gray-300 hover:text-white transition-colors">
          Cancel
        </a>
      </div>
    </form>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 disabled:cursor-not-allowed text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

