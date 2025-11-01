export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export const isDefined = <T>(value: T | null | undefined): value is T => {
  return value !== null && value !== undefined;
};

export const sanitizeObject = (input: unknown): unknown => {
  if (input === null || input === undefined) return input;
  if (typeof input === "string") return sanitizeString(input);
  if (typeof input !== "object") return input;
  if (Array.isArray(input)) return input.map(sanitizeObject);
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
};

export const sanitizeString = (str: string): string => {
  return str
    .replace(/[\x00-\x1F\x7F-\x9F]/g, "")
    .replace(/\x00/g, "")
    .trim();
};

