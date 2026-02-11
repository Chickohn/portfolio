import Link from "next/link";
import { notFound } from "next/navigation";

import { requireAdmin } from "@/lib/admin-auth";
import { getProjectForAdminById } from "@/lib/sanity/admin-queries";
import ProjectForm from "@/components/admin/project-form";
import { updateProjectAction } from "../../actions";

function stripSanitySectionMeta(sections: any[] | undefined) {
  if (!Array.isArray(sections)) return [];
  return sections.map((s) => {
    const { _key, _type, ...rest } = s || {};
    return rest;
  });
}

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  await requireAdmin();
  const id = decodeURIComponent(params.id);
  const project = await getProjectForAdminById(id);
  if (!project) notFound();

  const slug = project.slug?.current || "";
  const isInternal = !project.external && slug;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Edit project</h1>
          <p className="text-gray-300 mt-1">Update fields and save to Sanity.</p>
        </div>
        {isInternal ? (
          <Link
            href={`/projects/${slug}`}
            className="px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-colors"
          >
            View public page
          </Link>
        ) : null}
      </div>

      <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-6">
        <ProjectForm
          mode="edit"
          initial={{
            title: project.title || "",
            slug,
            description: project.description || "",
            category: project.category || "",
            technologies: Array.isArray(project.technologies) ? project.technologies : [],
            external: Boolean(project.external),
            externalUrl: project.externalUrl || "",
            published: Boolean(project.published),
            sectionsJson: JSON.stringify(stripSanitySectionMeta(project.sections), null, 2),
          }}
          action={updateProjectAction.bind(null, id)}
          submitLabel="Save changes"
        />
      </div>
    </div>
  );
}

