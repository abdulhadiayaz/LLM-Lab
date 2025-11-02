import { type Routing } from "express-zod-api";
import { healthRoutes } from "./routes/health";
import { experimentRoutes } from "./routes/experiments";

import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

export const routing: Routing = {
  health: healthRoutes,
  experiments: experimentRoutes,
};
