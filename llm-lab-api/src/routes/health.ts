import { createEndpoint } from "+/utils/createEndpoint";
import { z } from "zod";

export const healthRoutes = {
  check: createEndpoint({
    methods: ["get"],
    input: z.object({}),
    output: z.object({
      status: z.string(),
      timestamp: z.string(),
    }),
    handler: async () => {
      return {
        status: "ok",
        timestamp: new Date().toISOString(),
      };
    },
  }),

  echo: createEndpoint({
    methods: ["post"],
    input: z.object({
      message: z.string(),
    }),
    output: z.object({
      echo: z.string(),
    }),
    handler: async ({ input: { message } }) => {
      return {
        echo: message,
      };
    },
  }),
};
