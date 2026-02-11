import { z } from "zod";

/**
 * Canonical Project model for Sanity + custom admin UI.
 *
 * Notes:
 * - Public routing uses `slug` (string) for internal projects (detail pages).
 * - External/list-only projects set `external: true` and provide `externalUrl`.
 * - `technologies` powers the tag pills on `/projects` and the tech chips on detail pages.
 */

export type ProjectSectionType = "text" | "image" | "video" | "file" | "game";

export type ProjectSection =
  | {
      type: "text";
      content: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      caption?: string;
    }
  | {
      type: "video";
      src: string;
      alt: string;
      caption?: string;
      poster?: string;
      captions?: string;
      staticDescription?: string;
    }
  | {
      type: "file";
      src: string;
      filename?: string;
      description?: string;
    }
  | {
      type: "game";
      gameComponent: string; // e.g. "snake"
    };

export type ProjectRecord = {
  /** Sanity document id */
  _id: string;
  /** URL slug used for internal routing */
  slug: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  external: boolean;
  externalUrl?: string;
  published: boolean;
  sections: ProjectSection[];
};

const sectionBase = z.object({
  type: z.enum(["text", "image", "video", "file", "game"]),
});

export const projectSectionSchema: z.ZodType<ProjectSection> = z.discriminatedUnion("type", [
  sectionBase.extend({
    type: z.literal("text"),
    content: z.string().min(1, "Text content is required"),
  }),
  sectionBase.extend({
    type: z.literal("image"),
    src: z.string().min(1, "Image src is required"),
    alt: z.string().min(1, "Image alt text is required"),
    caption: z.string().optional(),
  }),
  sectionBase.extend({
    type: z.literal("video"),
    src: z.string().min(1, "Video src is required"),
    alt: z.string().min(1, "Video alt text is required"),
    caption: z.string().optional(),
    poster: z.string().optional(),
    captions: z.string().optional(),
    staticDescription: z.string().optional(),
  }),
  sectionBase.extend({
    type: z.literal("file"),
    src: z.string().min(1, "File src is required"),
    filename: z.string().optional(),
    description: z.string().optional(),
  }),
  sectionBase.extend({
    type: z.literal("game"),
    gameComponent: z.string().min(1, "Game component is required"),
  }),
]);

/**
 * Zod schema for admin create/update payloads (server-side only).
 * `_id` is omitted on create; required on update routes.
 */
export const projectInputSchema = z
  .object({
    slug: z
      .string()
      .min(1, "Slug is required")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be kebab-case (a-z0-9 and dashes)"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    category: z.string().min(1, "Category is required"),
    technologies: z.array(z.string().min(1)).min(1, "At least one technology is required"),
    external: z.boolean().default(false),
    externalUrl: z.string().url("External URL must be a valid URL").optional(),
    published: z.boolean().default(true),
    sections: z.array(projectSectionSchema).default([]),
  })
  .superRefine((val, ctx) => {
    if (val.external && !val.externalUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["externalUrl"],
        message: "External URL is required when external=true",
      });
    }
    if (val.external && val.sections.length > 0) {
      // We allow sections for external projects, but the current public site doesn't render them.
      // Keep it permissive; no issue.
    }
  });

export type ProjectInput = z.infer<typeof projectInputSchema>;

