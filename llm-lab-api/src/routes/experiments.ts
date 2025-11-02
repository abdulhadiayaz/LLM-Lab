import { createEndpoint } from "+/utils/createEndpoint";
import { z } from "zod";
import { prisma } from "+/utils/prismaClient";
import { errorOf, Errors } from "+/constants";
import { geminiService, GeminiService } from "+/services/gemini";
import { calculateMetrics } from "+/services/metrics";

// Parameter range schema
const parameterRangeSchema = z.object({
  temperature: z.array(z.number().min(0).max(2)).optional(),
  topP: z.array(z.number().min(0).max(1)).optional(),
  topK: z.array(z.number().int().positive()).optional(),
  maxOutputTokens: z.array(z.number().int().positive()).optional(),
});

// Create experiment input schema
const createExperimentSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(10000, "Prompt too long"),
  parameterRanges: parameterRangeSchema.optional(),
});

// Response schema for API
const responseSchema = z.object({
  id: z.string(),
  temperature: z.number(),
  topP: z.number(),
  topK: z.number().nullable(),
  maxTokens: z.number().nullable(),
  content: z.string(),
  metrics: z
    .object({
      coherenceScore: z.number(),
      completenessScore: z.number(),
      lengthScore: z.number(),
      readabilityScore: z.number(),
      structureScore: z.number(),
      overallScore: z.number(),
    })
    .nullable(),
  createdAt: z.string(),
});

export const experimentRoutes = {
  /**
   * Create a new experiment
   */
  create: createEndpoint({
    methods: ["post"],
    input: createExperimentSchema,
    output: z.object({
      id: z.string(),
      prompt: z.string(),
      createdAt: z.string(),
      parameterCombinationsCount: z.number(),
    }),
    handler: async ({ input: { prompt, parameterRanges } }) => {
      // Generate parameter combinations if ranges provided
      let parameterCombinationsCount = 1;
      if (parameterRanges) {
        const combinations = GeminiService.generateParameterCombinations({
          temperature: parameterRanges.temperature,
          topP: parameterRanges.topP,
          topK: parameterRanges.topK,
          maxOutputTokens: parameterRanges.maxOutputTokens,
        });
        parameterCombinationsCount = combinations.length;
      }

      const experiment = await prisma.experiment.create({
        data: {
          prompt,
        },
      });

      return {
        id: experiment.id,
        prompt: experiment.prompt,
        createdAt: experiment.createdAt.toISOString(),
        parameterCombinationsCount,
      };
    },
  }),

  /**
   * Get experiment details
   */
  get: createEndpoint({
    methods: ["get"],
    input: z.object({
      id: z.string().uuid("Invalid experiment ID"),
    }),
    output: z.object({
      id: z.string(),
      prompt: z.string(),
      createdAt: z.string(),
      updatedAt: z.string(),
      responses: z.array(responseSchema),
    }),
    handler: async ({ input: { id } }) => {
      const experiment = await prisma.experiment.findUnique({
        where: { id },
        include: {
          responses: {
            include: {
              metrics: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!experiment) {
        throw errorOf(Errors.NOT_FOUND);
      }

      return {
        id: experiment.id,
        prompt: experiment.prompt,
        createdAt: experiment.createdAt.toISOString(),
        updatedAt: experiment.updatedAt.toISOString(),
        responses: experiment.responses.map((r) => ({
          id: r.id,
          temperature: r.temperature,
          topP: r.topP,
          topK: r.topK,
          maxTokens: r.maxTokens,
          content: r.content,
          metrics: r.metrics
            ? {
                coherenceScore: r.metrics.coherenceScore,
                completenessScore: r.metrics.completenessScore,
                lengthScore: r.metrics.lengthScore,
                readabilityScore: r.metrics.readabilityScore,
                structureScore: r.metrics.structureScore,
                overallScore: r.metrics.overallScore,
              }
            : null,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    },
  }),

  /**
   * Generate responses for an experiment with parameter combinations
   */
  generate: createEndpoint({
    methods: ["post"],
    input: z.object({
      experimentId: z.string().uuid("Invalid experiment ID"),
      parameterRanges: parameterRangeSchema,
    }),
    output: z.object({
      experimentId: z.string(),
      generatedCount: z.number(),
      totalCombinations: z.number(),
      responses: z.array(
        z.object({
          id: z.string(),
          parameters: z.object({
            temperature: z.number(),
            topP: z.number(),
            topK: z.number().optional(),
            maxOutputTokens: z.number().optional(),
          }),
          content: z.string(),
          metrics: z.object({
            overallScore: z.number(),
          }),
        })
      ),
    }),
    handler: async ({ input: { experimentId, parameterRanges } }) => {
      // Verify experiment exists
      const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
      });

      if (!experiment) {
        throw errorOf(Errors.NOT_FOUND);
      }

      // Check if Gemini service is available
      if (!geminiService.isAvailable()) {
        throw new Error(
          "Gemini service is not configured. Please check GEMINI_API_KEY."
        );
      }

      // Generate parameter combinations
      const combinations = GeminiService.generateParameterCombinations({
        temperature: parameterRanges.temperature,
        topP: parameterRanges.topP,
        topK: parameterRanges.topK,
        maxOutputTokens: parameterRanges.maxOutputTokens,
      });

      if (combinations.length === 0) {
        throw errorOf(Errors.INVALID_INPUT);
      }

      // Generate responses from Gemini
      const geminiResults = await geminiService.generateMultipleResponses(
        experiment.prompt,
        combinations
      );

      // Store responses and calculate metrics
      const storedResponses = [];
      for (const { parameters, response } of geminiResults) {
        try {
          // Calculate metrics
          const metrics = calculateMetrics(response.content, {
            prompt: experiment.prompt,
          });

          // Store in database
          const storedResponse = await prisma.response.create({
            data: {
              experimentId,
              temperature: parameters.temperature ?? 0.7,
              topP: parameters.topP ?? 0.95,
              topK: parameters.topK ?? null,
              maxTokens: parameters.maxOutputTokens ?? null,
              content: response.content,
              rawResponse: response.rawResponse as object,
              metrics: {
                create: {
                  coherenceScore: metrics.coherenceScore,
                  completenessScore: metrics.completenessScore,
                  lengthScore: metrics.lengthScore,
                  readabilityScore: metrics.readabilityScore,
                  structureScore: metrics.structureScore,
                  overallScore: metrics.overallScore,
                },
              },
            },
            include: {
              metrics: true,
            },
          });

          storedResponses.push({
            id: storedResponse.id,
            parameters: {
              temperature: storedResponse.temperature,
              topP: storedResponse.topP,
              topK: storedResponse.topK ?? undefined,
              maxOutputTokens: storedResponse.maxTokens ?? undefined,
            },
            content: storedResponse.content,
            metrics: {
              overallScore: storedResponse.metrics?.overallScore ?? 0,
            },
          });
        } catch (error) {
          console.error(
            `Failed to store response for parameters ${JSON.stringify(parameters)}:`,
            error
          );
          // Continue with other responses even if one fails
        }
      }

      return {
        experimentId,
        generatedCount: storedResponses.length,
        totalCombinations: combinations.length,
        responses: storedResponses,
      };
    },
  }),

  /**
   * Get all responses for an experiment with optional sorting
   */
  getResponses: createEndpoint({
    methods: ["get"],
    input: z.object({
      experimentId: z.string().uuid("Invalid experiment ID"),
      sortBy: z
        .enum([
          "overallScore",
          "coherenceScore",
          "completenessScore",
          "temperature",
          "createdAt",
        ])
        .optional(),
      order: z.enum(["asc", "desc"]).optional(),
    }),
    output: z.object({
      responses: z.array(responseSchema),
    }),
    handler: async ({
      input: { experimentId, sortBy = "overallScore", order = "desc" },
    }) => {
      // Verify experiment exists
      const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
      });

      if (!experiment) {
        throw errorOf(Errors.NOT_FOUND);
      }

      // Build orderBy clause
      let orderBy: Record<string, "asc" | "desc"> = { createdAt: "desc" };
      if (sortBy === "temperature" || sortBy === "createdAt") {
        orderBy = { [sortBy]: order };
      } else if (sortBy.endsWith("Score")) {
        orderBy = {
          metrics: {
            [sortBy]: order,
          },
        } as any;
      }

      const responses = await prisma.response.findMany({
        where: { experimentId },
        include: {
          metrics: true,
        },
        orderBy,
      });

      return {
        responses: responses.map((r) => ({
          id: r.id,
          temperature: r.temperature,
          topP: r.topP,
          topK: r.topK,
          maxTokens: r.maxTokens,
          content: r.content,
          metrics: r.metrics
            ? {
                coherenceScore: r.metrics.coherenceScore,
                completenessScore: r.metrics.completenessScore,
                lengthScore: r.metrics.lengthScore,
                readabilityScore: r.metrics.readabilityScore,
                structureScore: r.metrics.structureScore,
                overallScore: r.metrics.overallScore,
              }
            : null,
          createdAt: r.createdAt.toISOString(),
        })),
      };
    },
  }),

  /**
   * Export experiment data
   */
  export: createEndpoint({
    methods: ["get"],
    input: z.object({
      experimentId: z.string().uuid("Invalid experiment ID"),
      format: z.enum(["json", "csv"]).optional().default("json"),
    }),
    output: z.union([
      z.object({
        format: z.literal("json"),
        data: z.any(),
      }),
      z.object({
        format: z.literal("csv"),
        data: z.string(),
      }),
    ]),
    handler: async ({ input: { experimentId, format } }) => {
      const experiment = await prisma.experiment.findUnique({
        where: { id: experimentId },
        include: {
          responses: {
            include: {
              metrics: true,
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      if (!experiment) {
        throw errorOf(Errors.NOT_FOUND);
      }

      if (format === "json") {
        return {
          format: "json" as const,
          data: {
            id: experiment.id,
            prompt: experiment.prompt,
            createdAt: experiment.createdAt.toISOString(),
            updatedAt: experiment.updatedAt.toISOString(),
            responses: experiment.responses.map((r) => ({
              id: r.id,
              parameters: {
                temperature: r.temperature,
                topP: r.topP,
                topK: r.topK,
                maxTokens: r.maxTokens,
              },
              content: r.content,
              metrics: r.metrics
                ? {
                    coherenceScore: r.metrics.coherenceScore,
                    completenessScore: r.metrics.completenessScore,
                    lengthScore: r.metrics.lengthScore,
                    readabilityScore: r.metrics.readabilityScore,
                    structureScore: r.metrics.structureScore,
                    overallScore: r.metrics.overallScore,
                  }
                : null,
              createdAt: r.createdAt.toISOString(),
            })),
          },
        };
      }

      // CSV format
      const headers = [
        "Response ID",
        "Temperature",
        "Top P",
        "Top K",
        "Max Tokens",
        "Content",
        "Coherence Score",
        "Completeness Score",
        "Length Score",
        "Readability Score",
        "Structure Score",
        "Overall Score",
        "Created At",
      ];

      const rows = experiment.responses.map((r) => [
        r.id,
        r.temperature.toString(),
        r.topP.toString(),
        (r.topK ?? "").toString(),
        (r.maxTokens ?? "").toString(),
        `"${r.content.replace(/"/g, '""')}"`, // Escape quotes in CSV
        (r.metrics?.coherenceScore ?? "").toString(),
        (r.metrics?.completenessScore ?? "").toString(),
        (r.metrics?.lengthScore ?? "").toString(),
        (r.metrics?.readabilityScore ?? "").toString(),
        (r.metrics?.structureScore ?? "").toString(),
        (r.metrics?.overallScore ?? "").toString(),
        r.createdAt.toISOString(),
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      return {
        format: "csv" as const,
        data: csvContent,
      };
    },
  }),

  /**
   * List all experiments (for dashboard/homepage)
   */
  list: createEndpoint({
    methods: ["get"],
    input: z.object({
      limit: z.coerce.number().int().positive().max(100).optional().default(10),
      offset: z.coerce.number().int().nonnegative().optional().default(0),
    }),
    output: z.object({
      experiments: z.array(
        z.object({
          id: z.string(),
          prompt: z.string(),
          responseCount: z.number(),
          createdAt: z.string(),
          updatedAt: z.string(),
        })
      ),
      total: z.number(),
    }),
    handler: async ({ input: { limit, offset } }) => {
      const [experiments, total] = await Promise.all([
        prisma.experiment.findMany({
          take: limit,
          skip: offset,
          orderBy: {
            updatedAt: "desc",
          },
          include: {
            _count: {
              select: {
                responses: true,
              },
            },
          },
        }),
        prisma.experiment.count(),
      ]);

      return {
        experiments: experiments.map((e) => ({
          id: e.id,
          prompt: e.prompt,
          responseCount: e._count.responses,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
        })),
        total,
      };
    },
  }),
};
