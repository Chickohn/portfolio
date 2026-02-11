import { getSanityReadClient } from "./sanity.client.read";

type SanitySlug = { current: string };

export type SanityProjectDoc = {
  _id: string;
  _type: "project";
  title: string;
  slug: SanitySlug;
  description: string;
  category: string;
  technologies: string[];
  external: boolean;
  externalUrl?: string;
  published: boolean;
  sections?: any[];
};

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

export async function getProjects(): Promise<SanityProjectDoc[]> {
  return getSanityReadClient().fetch(
    `*[_type == "project" && published == true] | order(title asc) { ${projectFields} }`
  );
}

export async function getProjectBySlug(slug: string): Promise<SanityProjectDoc | null> {
  return getSanityReadClient().fetch(
    `*[_type == "project" && slug.current == $slug][0] { ${projectFields} }`,
    { slug }
  );
}

