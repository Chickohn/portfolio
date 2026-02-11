/**
 * Sanity schema (reference) for `project`.
 *
 * We do NOT use Sanity Studio in this repo, but keeping schemas here:
 * - documents the inferred model
 * - enables optional Studio usage later if desired
 */
export default {
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "category",
      title: "Category",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "technologies",
      title: "Technologies",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: "external",
      title: "External project",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "externalUrl",
      title: "External URL",
      type: "url",
      hidden: ({ parent }: any) => !parent?.external,
    },
    {
      name: "published",
      title: "Published",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "sections",
      title: "Sections",
      type: "array",
      of: [
        {
          type: "object",
          name: "projectSection",
          fields: [
            {
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: ["text", "image", "video", "file", "game"],
              },
              validation: (Rule: any) => Rule.required(),
            },
            { name: "content", title: "Content", type: "text" },
            { name: "src", title: "Source URL/path", type: "string" },
            { name: "alt", title: "Alt text", type: "string" },
            { name: "caption", title: "Caption", type: "string" },
            { name: "filename", title: "Filename", type: "string" },
            { name: "poster", title: "Poster", type: "string" },
            { name: "captions", title: "Captions", type: "string" },
            { name: "staticDescription", title: "Static description", type: "text" },
            { name: "gameComponent", title: "Game component", type: "string" },
          ],
        },
      ],
    },
  ],
};

