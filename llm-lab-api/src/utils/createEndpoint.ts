import {
  defaultResultHandler,
  OutputValidationError,
  type IOSchema,
  EndpointsFactory,
  createMiddleware,
} from "express-zod-api";
import { type IncomingMessage } from "http";
import { inspect } from "util";
import { z } from "zod";
import { sanitizeObject } from "./functions";

const errorHandler =
  <
    A extends {
      input: unknown;
      options: { request: IncomingMessage; middlewareDuration: number };
    },
    B,
  >(
    handler: (t: A) => Promise<B>
  ) =>
  async (inputs: A) => {
    const sanitizedInput = sanitizeObject(inputs.input);
    try {
      const output = await handler(inputs);
      return output;
    } catch (e) {
      const error = e as Error;
      console.error("Endpoint error:", {
        method: inputs.options.request.method,
        url: inputs.options.request.url,
        error: error.message,
        stack: error.stack,
        inputs: inspect(sanitizedInput),
      });
      throw e;
    }
  };

const customResultHandler = {
  getPositiveResponse: defaultResultHandler.getPositiveResponse,
  getNegativeResponse: defaultResultHandler.getNegativeResponse,
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handler(args: any) {
    const { error, request, input, response } = args;
    if (error instanceof OutputValidationError) {
      console.error("Output validation error:", {
        method: request.method,
        url: request.url,
        error: error.message,
        inputs: inspect(sanitizeObject(input)),
      });
    }

    // Handles redirect cleanly
    if (response.statusCode === 302 && response.getHeader("Location")) {
      response.end();
      return;
    }
    return defaultResultHandler.handler(args);
  },
};

export const endpointsFactory = new EndpointsFactory({
  resultHandler: customResultHandler,
});

const noAuthMiddleware = createMiddleware({
  input: z.object({}),
  middleware: async ({ input: {}, request, response }) => {
    return { request, response, middlewareDuration: 0 };
  },
});

const noAuthEndpointFactory = endpointsFactory.addMiddleware(noAuthMiddleware);

export const createEndpoint = <
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  T extends IOSchema<any>,
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  R extends IOSchema<any>,
>(
  options: Parameters<typeof noAuthEndpointFactory.build<T, R>>[0]
) => {
  return noAuthEndpointFactory.build({
    ...options,
    handler: errorHandler(options.handler),
  });
};
