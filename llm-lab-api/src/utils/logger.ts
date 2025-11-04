import { inspect } from "util";
import { sanitizeObject, sanitizeString, isDefined } from "./functions";

const sanitizeLogs = (message: string, meta?: unknown): [string, unknown] => {
  const sanitizedMessage = sanitizeString(message);
  if (meta && typeof meta === "object")
    return [sanitizedMessage, sanitizeObject(meta)];
  if (typeof meta === "string") return [sanitizedMessage, sanitizeString(meta)];
  return [sanitizedMessage, meta];
};

const colors: Record<string, string> = {
  debug: "\u001b[33mdebug\u001b[0m",
  info: "\x1b[32minfo\x1b[0m",
  warn: "\x1b[33mwarn\x1b[0m",
  error: "\x1b[31merror\x1b[0m",
};

const log = (
  level: "debug" | "info" | "warn" | "error",
  message: string,
  meta?: unknown
) => {
  const now = new Date().toISOString();
  const [sanitizedMsg, sanitizedMeta] = sanitizeLogs(message, meta);
  let output = `${now} ${colors[level]}: ${sanitizedMsg}`;
  if (isDefined(sanitizedMeta)) {
    if (typeof sanitizedMeta === "object" && sanitizedMeta !== null) {
      output +=
        " " +
        inspect(sanitizedMeta, {
          depth: 5,
          colors: true,
          compact: true,
        });
    } else if (
      typeof sanitizedMeta === "string" ||
      typeof sanitizedMeta === "number" ||
      typeof sanitizedMeta === "boolean"
    ) {
      output += " " + String(sanitizedMeta);
    } else {
      output += " " + JSON.stringify(sanitizedMeta);
    }
  }
  console[level](output);
};

export const customLogger: Record<
  "info" | "debug" | "warn" | "error",
  (message: string, meta?: unknown) => unknown
> = {
  debug: (msg, meta) => log("debug", msg, meta),
  info: (msg, meta) => log("info", msg, meta),
  warn: (msg, meta) => log("warn", msg, meta),
  error: (msg, meta) => log("error", msg, meta),
};
