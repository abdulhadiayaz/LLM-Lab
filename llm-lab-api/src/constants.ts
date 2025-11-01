import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const Errors = {
  INVALID_INPUT: {
    message: "Invalid input provided",
    cause: "USER",
  },
  NOT_FOUND: {
    message: "Resource not found",
    cause: "USER",
  },
  SERVER_ERROR: {
    message: "An internal server error occurred",
    cause: "SERVER",
  },
} as const;

export const errorOf = (def: (typeof Errors)[keyof typeof Errors]) => {
  return new Error(def.message, { cause: def.cause });
};

