import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  experimentsApi,
  type CreateExperimentRequest,
  type GenerateRequest,
} from "./api";
import { type ParameterRanges } from "./constants";

// Query keys
export const queryKeys = {
  experiments: ["experiments"] as const,
  experiment: (id: string) => ["experiments", id] as const,
  responses: (id: string, sortBy?: string, order?: string) =>
    ["experiments", id, "responses", sortBy, order] as const,
};

// Hooks
export function useCreateExperiment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExperimentRequest) => experimentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.experiments });
    },
  });
}

export function useExperiment(id: string) {
  return useQuery({
    queryKey: queryKeys.experiment(id),
    queryFn: () => experimentsApi.get(id),
    enabled: !!id,
  });
}

export function useExperimentsList(limit = 10, offset = 0) {
  return useQuery({
    queryKey: [...queryKeys.experiments, limit, offset],
    queryFn: () => experimentsApi.list(limit, offset),
  });
}

export function useGenerateResponses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateRequest) => experimentsApi.generate(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.experiment(variables.experimentId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.responses(variables.experimentId),
      });
    },
  });
}

export function useExperimentResponses(
  experimentId: string,
  sortBy?: string,
  order?: "asc" | "desc"
) {
  return useQuery({
    queryKey: queryKeys.responses(experimentId, sortBy, order),
    queryFn: () => experimentsApi.getResponses(experimentId, sortBy, order),
    enabled: !!experimentId,
  });
}

export function useExportExperiment() {
  return useMutation({
    mutationFn: ({
      experimentId,
      format,
    }: {
      experimentId: string;
      format: "json" | "csv";
    }) => experimentsApi.export(experimentId, format),
  });
}

export function useParameterValidation(parameterRanges: ParameterRanges) {
  const validation = useMemo(() => {
    const missingParams: string[] = [];

    if (
      !parameterRanges.temperature ||
      parameterRanges.temperature.length === 0
    ) {
      missingParams.push("Temperature");
    }
    if (!parameterRanges.topP || parameterRanges.topP.length === 0) {
      missingParams.push("Top P");
    }
    if (!parameterRanges.topK || parameterRanges.topK.length === 0) {
      missingParams.push("Top K");
    }
    if (
      !parameterRanges.maxOutputTokens ||
      parameterRanges.maxOutputTokens.length === 0
    ) {
      missingParams.push("Max Output Tokens");
    }

    return {
      isValid: missingParams.length === 0,
      missingParams,
    };
  }, [parameterRanges]);

  return validation;
}
