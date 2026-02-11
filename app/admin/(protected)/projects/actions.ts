"use server";

import "server-only";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin-auth";
import { projectInputSchema, type ProjectInput, type ProjectSection } from "@/lib/project-model";
import { getSanityWriteClient } from "@/lib/sanity/sanity.client.write";

export type ProjectFormState =
  | { ok: false; message?: string }
  | { ok: true; message?: string };

function ensureWriteTokenConfigured() {
  if (!process.env.SANITY_API_WRITE_TOKEN) {
    throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  }
}

function toSanitySlug(slug: string) {
  return { _type: "slug", current: slug };
}

function toSanitySections(sections: ProjectSection[]) {
  return sections.map((s) => ({
    _key: randomUUID(),
    _type: "projectSection",
    ...s,
  }));
}

function parseProjectInputFromForm(
  formData: FormData
): { ok: true; data: ProjectInput } | { ok: false; message: string } {
  const technologiesRaw = String(formData.get("technologies") || "");
  const technologies = technologiesRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const sectionsRaw = String(formData.get("sections") || "[]");
  let sectionsParsed: unknown = [];
  try {
    sectionsParsed = JSON.parse(sectionsRaw);
  } catch {
    return { ok: false, message: "sections: Invalid JSON" };
  }

  const input = {
    slug: String(formData.get("slug") || ""),
    title: String(formData.get("title") || ""),
    description: String(formData.get("description") || ""),
    category: String(formData.get("category") || ""),
    technologies,
    external: formData.get("external") === "on",
    externalUrl: String(formData.get("externalUrl") || "") || undefined,
    published: formData.get("published") === "on",
    sections: sectionsParsed as any,
  };

  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    return { ok: false, message };
  }

  return { ok: true, data: parsed.data };
}

export async function createProjectAction(_prevState: ProjectFormState, formData: FormData): Promise<ProjectFormState> {
  try {
    await requireAdmin();
    ensureWriteTokenConfigured();

    const parsed = parseProjectInputFromForm(formData);
    if (!parsed.ok) return { ok: false, message: parsed.message };
    const input = parsed.data;

    const docId = `project.${input.slug}`;

    await getSanityWriteClient().createIfNotExists({
      _id: docId,
      _type: "project",
      title: input.title,
      slug: toSanitySlug(input.slug),
      description: input.description,
      category: input.category,
      technologies: input.technologies,
      external: input.external,
      externalUrl: input.external ? input.externalUrl : undefined,
      published: input.published,
      sections: toSanitySections(input.sections),
    });

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    if (!input.external) revalidatePath(`/projects/${input.slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Failed to create project" };
  }
}

export async function updateProjectAction(
  projectId: string,
  _prevState: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    await requireAdmin();
    ensureWriteTokenConfigured();

    const parsed = parseProjectInputFromForm(formData);
    if (!parsed.ok) return { ok: false, message: parsed.message };
    const input = parsed.data;

    await getSanityWriteClient()
      .patch(projectId)
      .set({
        title: input.title,
        slug: toSanitySlug(input.slug),
        description: input.description,
        category: input.category,
        technologies: input.technologies,
        external: input.external,
        externalUrl: input.external ? input.externalUrl : undefined,
        published: input.published,
        sections: toSanitySections(input.sections),
      })
      .commit();

    revalidatePath("/admin/projects");
    revalidatePath("/projects");
    if (!input.external) revalidatePath(`/projects/${input.slug}`);
    return { ok: true };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Failed to update project" };
  }
}

export async function deleteProjectAction(projectId: string) {
  await requireAdmin();
  ensureWriteTokenConfigured();

  await getSanityWriteClient().delete(projectId);
  revalidatePath("/admin/projects");
  revalidatePath("/projects");
}

export async function togglePublishAction(projectId: string, nextPublished: boolean) {
  await requireAdmin();
  ensureWriteTokenConfigured();

  await getSanityWriteClient().patch(projectId).set({ published: nextPublished }).commit();
  revalidatePath("/admin/projects");
}

