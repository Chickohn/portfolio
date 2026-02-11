import { getSanityReadClient } from "./sanity.client.read";

const projectFields = `
  _id,
  _type,
  title,
  slug,
  description,
  category,
  technologies,
  external,
  externalUrl,
  published,
  sections
`;

export async function getAllProjectsForAdmin(): Promise<any[]> {
  return getSanityReadClient().fetch(`*[_type == "project"] | order(_updatedAt desc) { ${projectFields} }`);
}

export async function getProjectForAdminById(id: string): Promise<any | null> {
  return getSanityReadClient().fetch(`*[_type == "project" && _id == $id][0] { ${projectFields} }`, { id });
}

