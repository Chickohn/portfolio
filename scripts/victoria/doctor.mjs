import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();
for (const filename of [".env.local", ".env"]) {
  const fullPath = path.join(root, filename);
  if (existsSync(fullPath)) {
    dotenv.config({ path: fullPath, quiet: true });
  }
}

const required = [
  "DATABASE_URL",
  "VICTORIA_SESSION_SECRET",
  "VICTORIA_TOKEN_HASH_SECRET",
  "VICTORIA_ABLY_API_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "VICTORIA_STORAGE_BUCKET",
];

const optional = [
  "VICTORIA_FEATURE_ENABLED",
  "VICTORIA_ALLOWED_HOSTS",
  "VICTORIA_SESSION_DAYS",
  "VICTORIA_ANALYTICS_RETENTION_DAYS",
  "VICTORIA_UPLOAD_MAX_BYTES",
  "VICTORIA_RATE_LIMIT_URL",
  "VICTORIA_RATE_LIMIT_TOKEN",
];

function present(name) {
  return Boolean(process.env[name]?.trim());
}

function valid(name) {
  const value = process.env[name]?.trim() ?? "";
  if (!value) return false;
  if (name === "DATABASE_URL") return value.startsWith("postgresql://") || value.startsWith("postgres://");
  if (name === "SUPABASE_URL") return value.startsWith("https://") && value.includes(".supabase.co");
  if (name === "VICTORIA_ABLY_API_KEY") return /^[^:]+\.[^:]+:.+$/.test(value);
  if (name === "VICTORIA_STORAGE_BUCKET") return value === "victoria-private";
  return true;
}

console.log("Victoria setup doctor");
console.log("=====================");

for (const name of required) {
  const label = !present(name) ? "MISS " : valid(name) ? "OK   " : "FIX  ";
  console.log(`${label} ${name}`);
}

for (const name of optional) {
  console.log(`${present(name) ? "OK   " : "INFO "} ${name}`);
}

const missing = required.filter((name) => !present(name) || !valid(name));

if (missing.length > 0) {
  console.log("");
  console.log("Missing or invalid provider configuration remains. Add/fix these in .env.local locally and in Vercel production before running migrations or generating claim links.");
  if (missing.includes("SUPABASE_URL")) {
    console.log("SUPABASE_URL must look like https://<project-ref>.supabase.co, not a postgres:// connection string.");
  }
  process.exit(1);
}

console.log("");
console.log("All required Victoria environment variables are present.");
