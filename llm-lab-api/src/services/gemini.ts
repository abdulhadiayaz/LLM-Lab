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
  private model: string = "gemini-2.5-flash";

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

  /**
   * Generate a response from Gemini with specified parameters
   */
  async generateResponse(
    prompt: string,
    parameters: GeminiParameters = {}
  ): Promise<GeminiResponse> {
    if (!this.genAI) {
      throw new Error("Gemini API key not configured");
    }

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
      const response = await result.response;

      const content = response.text();
      const finishReason = response.candidates?.[0]?.finishReason || "unknown";

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

      // Handle rate limiting
      if (err.message.includes("429") || err.message.includes("rate limit")) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }

      // Handle quota exceeded
      if (
        err.message.includes("quota") ||
        err.message.includes("RESOURCE_EXHAUSTED")
      ) {
        throw new Error("API quota exceeded. Please check your billing.");
      }

      // Handle invalid API key
      if (err.message.includes("API key") || err.message.includes("401")) {
        throw new Error("Invalid API key. Please check your GEMINI_API_KEY.");
      }

      console.error("Gemini API error:", err);
      throw new Error(`Failed to generate response: ${err.message}`);
    }
  }

  /**
   * Generate multiple responses with different parameter combinations
   * Returns an array of responses with their corresponding parameters
   */
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

    // Generate responses sequentially to avoid rate limiting issues
    for (const params of parameterCombinations) {
      try {
        const response = await this.generateResponse(prompt, params);
        results.push({ parameters: params, response });

        // Small delay to avoid hitting rate limits
        if (parameterCombinations.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error) {
        const err = error as Error;
        console.error(
          `Failed to generate response for parameters ${JSON.stringify(params)}:`,
          err
        );

        // Continue with other combinations even if one fails
        // Store error information in the response
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

  /**
   * Generate all combinations of parameters from ranges
   */
  static generateParameterCombinations(params: {
    temperature?: number[];
    topP?: number[];
    topK?: number[];
    maxOutputTokens?: number[];
  }): GeminiParameters[] {
    const {
      temperature = [0.7],
      topP = [0.95],
      topK = [40],
      maxOutputTokens = [2048],
    } = params;

    const combinations: GeminiParameters[] = [];

    for (const temp of temperature) {
      for (const tp of topP) {
        for (const tk of topK) {
          for (const tokens of maxOutputTokens) {
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

  /**
   * Check if the service is available
   */
  isAvailable(): boolean {
    return this.genAI !== null;
  }
}

// Export singleton instance
export const geminiService = new GeminiService();
