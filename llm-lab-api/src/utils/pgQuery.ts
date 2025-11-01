import pg from "pg";
import pgFormat from "pg-format";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const pgQuery = async <T = unknown>(
  query: string,
  values?: unknown[],
): Promise<T[]> => {
  const client = await pool.connect();
  try {
    const result = await client.query(query, values);
    return result.rows as T[];
  } finally {
    client.release();
  }
};

export { pgFormat };

// Helper functions for safe array handling
export const pgValues = (arr: unknown[][]): string => {
  return arr.map((row) => `(${row.map(() => "%L").join(",")})`).join(",");
};

export const pgIn = (arr: unknown[]): string => {
  return arr.map(() => "%L").join(",");
};

