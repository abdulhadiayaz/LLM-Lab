import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:80";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface Experiment {
  id: string;
  prompt: string;
  createdAt: string;
  updatedAt?: string;
  responseCount?: number;
}

export interface Response {
  id: string;
  temperature: number;
  topP: number;
  topK: number | null;
  maxTokens: number | null;
  content: string;
  metrics: {
    coherenceScore: number;
    completenessScore: number;
    lengthScore: number;
    readabilityScore: number;
    structureScore: number;
    overallScore: number;
  } | null;
  createdAt: string;
}

export interface ExperimentWithResponses extends Experiment {
  responses: Response[];
}

export interface ParameterRanges {
  temperature?: number[];
  topP?: number[];
  topK?: number[];
  maxOutputTokens?: number[];
}

export interface CreateExperimentRequest {
  prompt: string;
  parameterRanges?: ParameterRanges;
}

export interface GenerateRequest {
  experimentId: string;
  parameterRanges: ParameterRanges;
}

// API functions
export const experimentsApi = {
  create: async (data: CreateExperimentRequest) => {
    const response = await api.post("/experiments/create", data);
    return response.data;
  },

  get: async (id: string): Promise<ExperimentWithResponses> => {
    const response = await api.get("/experiments/get", {
      params: { id },
    });
    return response.data;
  },

  list: async (limit = 10, offset = 0) => {
    const response = await api.get("/experiments/list", {
      params: { limit, offset },
    });
    return response.data.data;
  },

  generate: async (data: GenerateRequest) => {
    const response = await api.post("/experiments/generate", {
      experimentId: data.experimentId,
      parameterRanges: data.parameterRanges,
    });
    return response.data;
  },

  getResponses: async (
    experimentId: string,
    sortBy?: string,
    order?: "asc" | "desc"
  ) => {
    const response = await api.get("/experiments/getResponses", {
      params: { experimentId, sortBy, order },
    });
    return response.data;
  },

  export: async (experimentId: string, format: "json" | "csv" = "json") => {
    const response = await api.get("/experiments/export", {
      params: { experimentId, format },
    });
    return response.data;
  },
};
