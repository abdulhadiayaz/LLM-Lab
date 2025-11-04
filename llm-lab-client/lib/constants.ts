export interface ParameterRanges {
  temperature: number[];
  topP: number[];
  topK: number[];
  maxOutputTokens: number[];
}

export const DEFAULT_PARAMETER_RANGES: ParameterRanges = {
  temperature: [0.1, 0.5, 0.9],
  topP: [0.95],
  topK: [40],
  maxOutputTokens: [2048],
};
