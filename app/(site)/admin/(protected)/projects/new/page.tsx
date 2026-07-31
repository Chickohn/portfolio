import { requireAdmin } from "@/lib/admin-auth";
import ProjectForm from "@/components/admin/project-form";
import { createProjectAction } from "../actions";

export default async function NewProjectPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">New project</h1>
        <p className="text-gray-300 mt-1">Create a new project document in Sanity.</p>
      </div>

      <div className="bg-gray-900/70 border border-white/10 rounded-2xl p-6">
        <ProjectForm
          mode="create"
          initial={{
            title: "",
            slug: "",
            description: "",
            category: "",
            technologies: [],
            external: false,
            externalUrl: "",
            published: true,
            sectionsJson: "[]",
          }}
          action={createProjectAction}
          submitLabel="Create project"
        />
      </div>
    </div>
  );
}

