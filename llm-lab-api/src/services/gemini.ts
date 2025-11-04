import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: ".env.local" });
  dotenv.config();
}

export interface GeminiParameters {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  content: string;
  rawResponse: unknown;
  finishReason?: string;
}

export class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model = "gemini-2.0-flash-lite	";

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn(
        "GEMINI_API_KEY not found in environment variables. Gemini service will not be available."
      );
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
    } catch (error) {
      console.error("Failed to initialize Gemini client:", error);
      throw new Error("Failed to initialize Gemini service");
    }
  }

  async generateResponse(
    prompt: string,
    parameters: GeminiParameters = {},
    retryCount = 0
  ): Promise<GeminiResponse> {
    if (!this.genAI) {
      throw new Error("Gemini API key not configured");
    }

    const maxRetries = 3;
    const baseDelay = 1000; // 1 second base delay

    try {
      const {
        temperature = 0.7,
        topP = 0.95,
        topK = 40,
        maxOutputTokens = 2048,
      } = parameters;

      const model = this.genAI.getGenerativeModel({
        model: this.model,
        generationConfig: {
          temperature,
          topP,
          topK,
          maxOutputTokens,
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;

      const content = response.text();
      const finishReason = response.candidates?.[0]?.finishReason ?? "unknown";

      return {
        content,
        rawResponse: {
          candidates: response.candidates,
          promptFeedback: response.promptFeedback,
        },
        finishReason,
      };
    } catch (error) {
      const err = error as Error;
      const errorMessage = err.message.toLowerCase();

      if (
        (errorMessage.includes("503") ||
          errorMessage.includes("service unavailable") ||
          errorMessage.includes("try again later")) &&
        retryCount < maxRetries
      ) {
        const delay = baseDelay * Math.pow(2, retryCount);
        console.log(
          `Gemini API overloaded (503). Retrying in ${delay}ms (attempt ${
            retryCount + 1
          }/${maxRetries})...`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.generateResponse(prompt, parameters, retryCount + 1);
      }

      if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("resource_exhausted")
      ) {
        throw new Error("API quota exceeded. Please check your billing.");
      }

      if (errorMessage.includes("api key") || errorMessage.includes("401")) {
        throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
      }

      if (
        (errorMessage.includes("503") ||
          errorMessage.includes("service unavailable") ||
          errorMessage.includes("overloaded")) &&
        retryCount >= maxRetries
      ) {
        throw new Error(
          "The model is currently overloaded. Please try again in a few moments."
        );
      }

      console.error("Gemini API error:", err);
      throw new Error(`Failed to generate response: ${err.message}`);
    }
  }

  async generateMultipleResponses(
    prompt: string,
    parameterCombinations: GeminiParameters[]
  ): Promise<
    Array<{ parameters: GeminiParameters; response: GeminiResponse }>
  > {
    const results: Array<{
      parameters: GeminiParameters;
      response: GeminiResponse;
    }> = [];

    for (let i = 0; i < parameterCombinations.length; i++) {
      const params = parameterCombinations[i];
      if (!params) continue;

      try {
        const response = await this.generateResponse(prompt, params);
        results.push({ parameters: params, response });

        if (i < parameterCombinations.length - 1) {
          const delay = parameterCombinations.length > 10 ? 500 : 300;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        const err = error as Error;
        console.error(
          `Failed to generate response for parameters ${JSON.stringify(params)}:`,
          err
        );

        results.push({
          parameters: params,
          response: {
            content: `Error: ${err.message}`,
            rawResponse: { error: err.message },
            finishReason: "ERROR",
          },
        });
      }
    }

    return results;
  }

  static generateParameterCombinations(params: {
    temperature?: number[];
    topP?: number[];
    topK?: number[];
    maxOutputTokens?: number[];
  }): GeminiParameters[] {
    if (!params.temperature || params.temperature.length === 0) {
      throw new Error("Temperature parameter range is required");
    }
    if (!params.topP || params.topP.length === 0) {
      throw new Error("Top P parameter range is required");
    }
    if (!params.topK || params.topK.length === 0) {
      throw new Error("Top K parameter range is required");
    }
    if (!params.maxOutputTokens || params.maxOutputTokens.length === 0) {
      throw new Error("Max Output Tokens parameter range is required");
    }

    const combinations: GeminiParameters[] = [];

    for (const temp of params.temperature) {
      for (const tp of params.topP) {
        for (const tk of params.topK) {
          for (const tokens of params.maxOutputTokens) {
            combinations.push({
              temperature: temp,
              topP: tp,
              topK: tk,
              maxOutputTokens: tokens,
            });
          }
        }
      }
    }

    return combinations;
  }

  isAvailable(): boolean {
    return this.genAI !== null;
  }
}

export const geminiService = new GeminiService();
