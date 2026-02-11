import { promises as fs } from "node:fs";
import path from "node:path";

import { loadEnvForScripts } from "./load-env";
import { getSanityWriteClientNode } from "../lib/sanity/sanity.client.write.node";
import { slugify } from "../lib/slug";

type BackupProjectSection = {
  type: string;
  [k: string]: unknown;
};

type BackupInternalProject = {
  id: string;
  title: string;
  description: string;
  category: string;
  technologies: string[];
  sections: BackupProjectSection[];
};

type BackupExternalProject = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  external: boolean;
  link?: string;
};

type BackupPayload = {
  version: number;
  generatedAt: string;
  internalProjects: BackupInternalProject[];
  externalProjects: BackupExternalProject[];
};

function isUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function toSanitySlug(slug: string) {
  return { _type: "slug", current: slug };
}

function repoRoot() {
  return path.resolve(__dirname, "..");
}

async function readBackup(backupPath: string): Promise<BackupPayload> {
  const raw = await fs.readFile(backupPath, "utf8");
  return JSON.parse(raw) as BackupPayload;
}

async function main() {
  loadEnvForScripts();

  const writeToken = process.env.SANITY_API_WRITE_TOKEN;
  if (!writeToken) {
    throw new Error("Missing SANITY_API_WRITE_TOKEN (server-only).");
  }

  const argPath = process.argv[2];
  let backupPath: string;
  if (argPath) {
    backupPath = path.resolve(process.cwd(), argPath);
  } else {
    const backupsDir = path.join(repoRoot(), "backups");
    const entries = await fs.readdir(backupsDir);
    const candidates = entries
      .filter((f) => f.startsWith("projects-backup-") && f.endsWith(".json"))
      .sort();
    const latest = candidates[candidates.length - 1];
    if (!latest) {
      throw new Error(`No backup files found in ${backupsDir}. Run: npm run backup:projects`);
    }
    backupPath = path.join(backupsDir, latest);
  }

  const backup = await readBackup(backupPath);

  const docs: any[] = [];

  // Internal projects (detail pages) — preserve slug stability (slug === id)
  for (const p of backup.internalProjects) {
    const slug = p.id;
    docs.push({
      _id: `project.${slug}`,
      _type: "project",
      title: p.title,
      slug: toSanitySlug(slug),
      description: p.description,
      category: p.category,
      technologies: p.technologies,
      external: false,
      externalUrl: undefined,
      published: true,
      sections: (p.sections || []).map((s: any) => {
        const { _key, _type, ...rest } = s || {};
        return { _type: "projectSection", ...rest };
      }),
    });
  }

  // External/list-only projects — normalize slug + move URL to externalUrl when needed
  for (const p of backup.externalProjects) {
    const url = p.link || (isUrl(p.slug) ? p.slug : undefined);
    const rawSlug = isUrl(p.slug) ? slugify(p.title) : p.slug;
    const slug = slugify(rawSlug);

    docs.push({
      _id: `project.${slug}`,
      _type: "project",
      title: p.title,
      slug: toSanitySlug(slug),
      description: p.description,
      category: p.category,
      technologies: p.tags,
      external: true,
      externalUrl: url,
      published: true,
      sections: [],
    });
  }

  // Create docs safely without overwriting existing documents.
  const tx = getSanityWriteClientNode().transaction();
  for (const doc of docs) {
    tx.createIfNotExists(doc);
  }

  const res = await tx.commit();

  // eslint-disable-next-line no-console
  console.log(`Imported ${docs.length} projects from backup: ${backupPath}`);
  // eslint-disable-next-line no-console
  console.log(`Transaction: ${res.transactionId}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

