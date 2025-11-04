import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:80";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export type Experiment = {
  id: string;
  prompt: string;
  createdAt: string;
  updatedAt?: string;
  responseCount?: number;
};

export type DetailedMetrics = {
  structural: {
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    charCount: number;
    avgSentenceLength: number;
    sentenceLengthVariance: number;
    avgParagraphLength: number;
    formatting: {
      hasCodeBlocks: boolean;
      codeBlockCount: number;
      hasBulletPoints: boolean;
      bulletPointCount: number;
      hasNumberedList: boolean;
      numberedListCount: number;
      hasHeaders: boolean;
      headerCount: number;
    };
    structure: {
      hasIntroduction: boolean;
      hasConclusion: boolean;
      transitionWordCount: number;
      transitionWordDensity: number;
    };
    structureScore: number;
  };
  linguistic: {
    vocabularyDiversity: {
      uniqueWords: number;
      totalWords: number;
      typeTokenRatio: number;
    };
    readability: {
      fleschReadingEase: number;
      interpretation: string;
      avgSyllablesPerWord: number;
      complexWordRatio: number;
    };
    repetition: {
      bigramRepetition: number;
      trigramRepetition: number;
    };
    wordQuality: {
      hedgeWordCount: number;
      hedgeWordDensity: number;
      fillerWordCount: number;
      fillerWordDensity: number;
    };
    linguisticScore: number;
  };
  relevance: {
    promptKeywords: string[];
    keywordMatches: Array<{ keyword: string; count: number; present: boolean }>;
    keywordCoverage: number;
    earlyKeywordPresence: number;
    keywordDensity: number;
    totalKeywordMentions: number;
    relevanceScore: number;
  };
  summary: string[];
};

export type Response = {
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
    detailedMetrics?: DetailedMetrics;
  } | null;
  createdAt: string;
};

export type ExperimentWithResponses = Experiment & {
  responses: Response[];
};

export type ParameterRanges = {
  temperature?: number[];
  topP?: number[];
  topK?: number[];
  maxOutputTokens?: number[];
};

export type CreateExperimentRequest = {
  prompt: string;
  parameterRanges?: ParameterRanges;
};

export type GenerateRequest = {
  experimentId: string;
  parameterRanges: ParameterRanges;
};

export const experimentsApi = {
  create: async (data: CreateExperimentRequest) => {
    const response = await api.post("/experiments/create", data);
    return response.data.data;
  },

  get: async (id: string): Promise<ExperimentWithResponses> => {
    const response = await api.get("/experiments/get", {
      params: { id },
    });
    return response.data.data;
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
    return response.data.data;
  },

  getResponses: async (
    experimentId: string,
    sortBy?: string,
    order?: "asc" | "desc"
  ) => {
    const response = await api.get("/experiments/getResponses", {
      params: { experimentId, sortBy, order },
    });
    return response.data.data;
  },

  export: async (experimentId: string, format: "json" | "csv" = "json") => {
    const response = await api.get("/experiments/export", {
      params: { experimentId, format },
    });
    return response.data.data;
  },
};
