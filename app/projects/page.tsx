import ProjectsPageClient from "@/components/projects/projects-page-client";
import { getPublicProjectItems } from "@/lib/public-projects";

export default async function ProjectsPage() {
  const allProjects = await getPublicProjectItems();
  return <ProjectsPageClient allProjects={allProjects} />;
}

