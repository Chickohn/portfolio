import Link from "next/link";

import { requireAdmin } from "@/lib/admin-auth";
import { getAllProjectsForAdmin } from "@/lib/sanity/admin-queries";
import { deleteProjectAction, togglePublishAction } from "./actions";
import { ConfirmSubmitButton } from "@/components/admin/confirm-submit-button";

export default async function AdminProjectsPage() {
  await requireAdmin();
  const projects = await getAllProjectsForAdmin();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Projects</h1>
          <p className="text-gray-300 mt-1">Create, edit, publish, and delete projects.</p>
        </div>
        <Link
          href="/admin/projects/new"
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          New project
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 backdrop-blur-sm">
        <div className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-3 text-xs text-gray-300 border-b border-white/10">
          <div>Title</div>
          <div>Slug</div>
          <div>Category</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {projects.length === 0 ? (
          <div className="p-6 text-gray-300">No projects yet.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {projects.map((p: any) => (
              <div key={p._id} className="grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_0.8fr] gap-3 px-4 py-4">
                <div className="text-white font-medium">
                  {p.title} {p.external ? <span className="text-xs text-gray-400">(external)</span> : null}
                </div>
                <div className="text-gray-300 text-sm">{p.slug?.current || "-"}</div>
                <div className="text-gray-300 text-sm">{p.category || "-"}</div>
                <div className="text-sm">
                  {p.published ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-green-500/15 text-green-200 border border-green-500/30">
                      Published
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-yellow-500/15 text-yellow-200 border border-yellow-500/30">
                      Unpublished
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  <form action={togglePublishAction.bind(null, p._id, !p.published)}>
                    <button
                      type="submit"
                      className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                    >
                      {p.published ? "Unpublish" : "Publish"}
                    </button>
                  </form>

                  <Link
                    href={`/admin/projects/${encodeURIComponent(p._id)}/edit`}
                    className="px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm transition-colors"
                  >
                    Edit
                  </Link>

                  <form action={deleteProjectAction.bind(null, p._id)}>
                    <ConfirmSubmitButton
                      confirmMessage={`Delete “${p.title}”? This cannot be undone.`}
                      className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm transition-colors"
                    >
                      Delete
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

