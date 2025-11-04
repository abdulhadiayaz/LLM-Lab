import { delay } from "./functions";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from "@prisma/client/runtime/library";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

const DEBUGGING_PRISMA_QUERIES = false;

const prismaBase = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
  ],
});

prismaBase.$on("query", (e) => {
  if (DEBUGGING_PRISMA_QUERIES)
    console.log(
      `\u001b[36mPrisma Query\u001b[0m: ${e.query} ${e.params}`,
      "\nTime taken:",
      e.duration,
    );
});

export const prisma = prismaBase.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (e) {
          const firstError = e as Error;
          if (
            (firstError instanceof PrismaClientKnownRequestError ||
              firstError instanceof PrismaClientInitializationError) &&
            process.env.RETRY_PRISMA_DB_CONNECTION_ERRORS
          ) {
            await delay(60000);
            try {
              return await query(args);
            } catch (e) {
              const secondError = e as Error;
              secondError.message = `Encountered error after 60s delay + retry: ${secondError.message}\n\nOriginal error: ${firstError.message}`;
              throw secondError;
            }
          }
          throw firstError;
        }
      },
    },
  },
}) as typeof prismaBase;

