import type { ProjectItem } from "@/types";

import { additionalProjects } from "@/lib/additional-projects";
import { getProjectById, getAllProjectIds, projects as hardcodedInternalProjects } from "@/lib/projects";
import type { Project, ProjectSection } from "@/lib/projects";
import { getProjectBySlug as getSanityProjectBySlug, getProjects as getSanityProjects } from "@/lib/sanity/queries";

function hardcodedListing(): ProjectItem[] {
  return [
    ...hardcodedInternalProjects.map((project) => ({
      slug: project.id,
      title: project.title,
      description: project.description,
      tags: project.technologies,
      category: project.category,
      external: false,
    })),
    ...additionalProjects,
  ];
}

function mapSanityToListingItem(p: any): ProjectItem {
  return {
    slug: p.slug?.current || "",
    title: p.title || "",
    description: p.description || "",
    tags: Array.isArray(p.technologies) ? p.technologies : [],
    category: p.category || "",
    external: Boolean(p.external),
    link: p.externalUrl || undefined,
  };
}

function mapSanityToInternalProject(p: any): Project {
  const slug = p.slug?.current || p._id || "";
  const sections = Array.isArray(p.sections) ? p.sections : [];
  const normalizedSections: ProjectSection[] = sections
    .map((s: any) => {
      const { _key, _type, ...rest } = s || {};
      return rest;
    })
    // keep only sections that at least have a type
    .filter((s: any) => typeof s?.type === "string") as ProjectSection[];

  return {
    id: slug,
    title: p.title || "",
    description: p.description || "",
    category: p.category || "",
    technologies: Array.isArray(p.technologies) ? p.technologies : [],
    sections: normalizedSections,
  };
}

/**
 * Public listing: Sanity-first, fallback to hard-coded arrays on error/empty.
 * Keeps UI output identical by matching the existing `ProjectItem` shape.
 *
 * Feature flag:
 * - Set `SANITY_DISABLE_FALLBACK=true` once migration is confirmed to ensure the site only uses Sanity.
 */
export async function getPublicProjectItems(): Promise<ProjectItem[]> {
  try {
    const sanity = await getSanityProjects();
    if (Array.isArray(sanity) && sanity.length > 0) {
      return sanity.map(mapSanityToListingItem);
    }
  } catch {
    // fall back
  }
  if (process.env.SANITY_DISABLE_FALLBACK === "true") {
    throw new Error("Sanity returned no data and fallback is disabled.");
  }
  return hardcodedListing();
}

/**
 * Public detail: Sanity-first, fallback to hard-coded internal projects.
 */
export async function getPublicInternalProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const sanity = await getSanityProjectBySlug(slug);
    if (sanity && !sanity.external) return mapSanityToInternalProject(sanity);
  } catch {
    // fall back
  }
  if (process.env.SANITY_DISABLE_FALLBACK === "true") {
    return undefined;
  }
  return getProjectById(slug);
}

/**
 * Used for sitemap / static params: internal project slugs only.
 */
export async function getPublicInternalProjectSlugs(): Promise<string[]> {
  try {
    const sanity = await getSanityProjects();
    const internal = sanity.filter((p: any) => !p.external && p.slug?.current).map((p: any) => p.slug.current);
    if (internal.length > 0) return internal;
  } catch {
    // fall back
  }
  if (process.env.SANITY_DISABLE_FALLBACK === "true") {
    return [];
  }
  return getAllProjectIds();
}

