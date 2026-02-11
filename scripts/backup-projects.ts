import { promises as fs } from "node:fs";
import path from "node:path";

import { projects } from "../lib/projects";
import { additionalProjects } from "../lib/additional-projects";
import { loadEnvForScripts } from "./load-env";

type BackupPayload = {
  version: 1;
  generatedAt: string;
  /**
   * Internal projects that have detail pages at `/projects/[slug]`.
   * In the current site, slug === id.
   */
  internalProjects: typeof projects;
  /**
   * External/extra projects that only appear on `/projects` listing.
   */
  externalProjects: typeof additionalProjects;
};

function formatDateForFilename(d: Date): string {
  // YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  loadEnvForScripts();

  const now = new Date();
  const generatedAt = now.toISOString();
  const dateStamp = formatDateForFilename(now);

  const payload: BackupPayload = {
    version: 1,
    generatedAt,
    internalProjects: projects,
    externalProjects: additionalProjects,
  };

  const repoRoot = path.resolve(__dirname, "..");
  const backupsDir = path.join(repoRoot, "backups");
  const outPath = path.join(backupsDir, `projects-backup-${dateStamp}.json`);

  await fs.mkdir(backupsDir, { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote backup to: ${outPath}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

