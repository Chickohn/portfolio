import postgres from "postgres";

const globalForVictoriaDb = globalThis as typeof globalThis & {
  victoriaSql?: postgres.Sql;
};

export function getSql() {
  if (globalForVictoriaDb.victoriaSql) {
    return globalForVictoriaDb.victoriaSql;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Victoria private area");
  }

  globalForVictoriaDb.victoriaSql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
  return globalForVictoriaDb.victoriaSql;
}

export type DbRow = Record<string, unknown>;
