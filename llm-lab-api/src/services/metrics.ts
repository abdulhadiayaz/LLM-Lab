function tokenizeSentences(text: string): string[] {
  return text.match(/[^.!?]+[.!?]+/g) || [];
}

function tokenizeWords(text: string): string[] {
  return text.match(/\b\w+\b/g) || [];
}

export interface QualityMetrics {
  coherenceScore: number;
  completenessScore: number;
  lengthScore: number;
  readabilityScore: number;
  structureScore: number;
  overallScore: number;
  detailedMetrics?: {
    structural: StructuralMetrics;
    linguistic: LinguisticMetrics;
    relevance: RelevanceMetrics;
    summary: string[];
  };
}

export interface StructuralMetrics {
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
}

export interface LinguisticMetrics {
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
}

export interface RelevanceMetrics {
  promptKeywords: string[];
  keywordMatches: Array<{ keyword: string; count: number; present: boolean }>;
  keywordCoverage: number;
  earlyKeywordPresence: number;
  keywordDensity: number;
  totalKeywordMentions: number;
  relevanceScore: number;
}

export interface MetricsOptions {
  prompt?: string;
  expectedLength?: number;
}

/**
 * Calculate quality metrics for an LLM response
 */
export function calculateMetrics(
  response: string,
  options: MetricsOptions = {}
): QualityMetrics {
  if (!response || response.trim().length === 0) {
    return {
      coherenceScore: 0,
      completenessScore: 0,
      lengthScore: 0,
      readabilityScore: 0,
      structureScore: 0,
      overallScore: 0,
      detailedMetrics: {
        structural: {
          wordCount: 0,
          sentenceCount: 0,
          paragraphCount: 0,
          charCount: 0,
          avgSentenceLength: 0,
          sentenceLengthVariance: 0,
          avgParagraphLength: 0,
          formatting: {
            hasCodeBlocks: false,
            codeBlockCount: 0,
            hasBulletPoints: false,
            bulletPointCount: 0,
            hasNumberedList: false,
            numberedListCount: 0,
            hasHeaders: false,
            headerCount: 0,
          },
          structure: {
            hasIntroduction: false,
            hasConclusion: false,
            transitionWordCount: 0,
            transitionWordDensity: 0,
          },
          structureScore: 0,
        },
        linguistic: {
          vocabularyDiversity: {
            uniqueWords: 0,
            totalWords: 0,
            typeTokenRatio: 0,
          },
          readability: {
            fleschReadingEase: 0,
            interpretation: "Very Difficult",
            avgSyllablesPerWord: 0,
            complexWordRatio: 0,
          },
          repetition: {
            bigramRepetition: 0,
            trigramRepetition: 0,
          },
          wordQuality: {
            hedgeWordCount: 0,
            hedgeWordDensity: 0,
            fillerWordCount: 0,
            fillerWordDensity: 0,
          },
          linguisticScore: 0,
        },
        relevance: options.prompt
          ? {
              promptKeywords: [],
              keywordMatches: [],
              keywordCoverage: 0,
              earlyKeywordPresence: 0,
              keywordDensity: 0,
              totalKeywordMentions: 0,
              relevanceScore: 0,
            }
          : {
              promptKeywords: [],
              keywordMatches: [],
              keywordCoverage: 0,
              earlyKeywordPresence: 0,
              keywordDensity: 0,
              totalKeywordMentions: 0,
              relevanceScore: 0,
            },
        summary: ["Empty or invalid response"],
      },
    };
  }

  const coherenceScore = calculateCoherence(response);
  const completenessScore = calculateCompleteness(response, options.prompt);
  const lengthScore = calculateLengthScore(response, options.expectedLength);
  const readabilityScore = calculateReadability(response);
  const structureScore = calculateStructure(response);

  const structuralMetrics = calculateStructuralMetrics(response);
  const linguisticMetrics = calculateLinguisticMetrics(response);
  const relevanceMetrics = options.prompt
    ? calculateKeywordRelevance(options.prompt, response)
    : null;

  const enhancedStructureScore = structuralMetrics.structureScore;
  const enhancedLinguisticScore = linguisticMetrics.linguisticScore;
  const enhancedRelevanceScore =
    relevanceMetrics?.relevanceScore || completenessScore;

  const overallScore =
    structuralMetrics.structureScore * 0.3 +
    linguisticMetrics.linguisticScore * 0.3 +
    (relevanceMetrics?.relevanceScore || completenessScore) * 0.4;

  const summary = generateSummary(
    structuralMetrics,
    linguisticMetrics,
    relevanceMetrics,
    overallScore
  );

  return {
    coherenceScore,
    completenessScore: enhancedRelevanceScore,
    lengthScore,
    readabilityScore,
    structureScore: enhancedStructureScore,
    overallScore: Math.round(overallScore * 1000) / 1000,
    detailedMetrics: {
      structural: structuralMetrics,
      linguistic: linguisticMetrics,
      relevance: relevanceMetrics || {
        promptKeywords: [],
        keywordMatches: [],
        keywordCoverage: 0,
        earlyKeywordPresence: 0,
        keywordDensity: 0,
        totalKeywordMentions: 0,
        relevanceScore: completenessScore,
      },
      summary,
    },
  };
}

/**
 * Calculate coherence score based on sentence flow and logical indicators
 */
function calculateCoherence(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const sentences = tokenizeSentences(text);
  if (sentences.length < 2) return 0.5;

  let score = 0.5;
  const flowIndicators = [
    "however",
    "therefore",
    "because",
    "thus",
    "consequently",
    "furthermore",
    "additionally",
    "moreover",
    "nevertheless",
    "hence",
    "although",
    "despite",
    "while",
  ];

  const lowerText = text.toLowerCase();
  const indicatorCount = flowIndicators.reduce(
    (count, indicator) => count + (lowerText.split(indicator).length - 1),
    0
  );

  score += Math.min(indicatorCount / sentences.length, 0.3);

  const sentenceLengths = sentences.map((s) => s.split(" ").length);
  const avgLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
  const variance =
    sentenceLengths.reduce(
      (sum, len) => sum + Math.pow(len - avgLength, 2),
      0
    ) / sentenceLengths.length;

  const varianceScore = Math.max(
    0,
    Math.min(1, 1 - Math.abs(variance / avgLength - 0.5))
  );
  score += varianceScore * 0.2;

  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate completeness based on addressing the prompt
 */
function calculateCompleteness(response: string, prompt?: string): number {
  if (!response || response.trim().length === 0) return 0;

  let score = 0.7;
  if (!prompt) return score;

  const stopwords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "should",
    "could",
    "can",
    "may",
    "might",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
  ]);

  const promptTokens = tokenizeWords(prompt.toLowerCase());
  const responseTokens = tokenizeWords(response.toLowerCase());

  const promptKeywords = promptTokens.filter(
    (word) => word.length > 3 && !stopwords.has(word)
  );
  const responseKeywords = new Set(
    responseTokens.filter((word) => word.length > 3 && !stopwords.has(word))
  );

  if (promptKeywords.length === 0) return score;

  // Check how many prompt keywords appear in response
  const matchedKeywords = promptKeywords.filter((keyword) =>
    responseKeywords.has(keyword)
  ).length;

  const keywordScore = matchedKeywords / promptKeywords.length;

  // Check if response seems complete (not truncated)
  const hasEndPunctuation = /[.!?]\s*$/.test(response.trim());
  const completenessIndicator = hasEndPunctuation ? 1 : 0.7;

  score = keywordScore * 0.7 + completenessIndicator * 0.3;

  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate length appropriateness score
 */
function calculateLengthScore(
  response: string,
  expectedLength?: number
): number {
  if (!response) return 0;

  const wordCount = response.split(/\s+/).filter((w) => w.length > 0).length;
  const charCount = response.length;

  // If no expected length, use heuristics based on typical response lengths
  if (!expectedLength) {
    // Typical good response: 50-500 words
    if (wordCount < 10) return 0.3; // Too short
    if (wordCount > 2000) return 0.6; // Too long but acceptable
    if (wordCount >= 50 && wordCount <= 500) return 1.0; // Ideal range
    if (wordCount < 50) return 0.5 + (wordCount / 50) * 0.5; // Below ideal
    return 1.0 - ((wordCount - 500) / 1500) * 0.4; // Above ideal but decreasing
  }

  // Compare to expected length
  const ratio = wordCount / expectedLength;
  if (ratio < 0.5) return ratio * 1.5; // Too short
  if (ratio > 2.0) return Math.max(0.3, 1 - (ratio - 2) * 0.2); // Too long
  return 1.0; // Within acceptable range
}

/**
 * Calculate readability score (simplified Flesch Reading Ease)
 */
function calculateReadability(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  const sentences = tokenizeSentences(text);
  if (sentences.length === 0) return 0;

  const words = tokenizeWords(text);
  const syllables = words.reduce((total, word) => {
    // Simplified syllable counting
    const syllableCount = countSyllables(word);
    return total + syllableCount;
  }, 0);

  const avgSentenceLength = words.length / sentences.length;
  const avgSyllablesPerWord = syllables / words.length;

  // Simplified Flesch Reading Ease calculation
  // Score ranges from 0-100, we normalize to 0-1
  // Higher is easier to read
  const fleschScore =
    206.835 - 1.015 * avgSentenceLength - 84.6 * avgSyllablesPerWord;

  // Normalize to 0-1 range (typical scores are 0-100)
  // We consider 60-100 as "good" (0.7-1.0), 30-60 as "ok" (0.4-0.7), below 30 as "poor" (0-0.4)
  if (fleschScore >= 60) return 0.7 + ((fleschScore - 60) / 40) * 0.3; // 0.7-1.0
  if (fleschScore >= 30) return 0.4 + ((fleschScore - 30) / 30) * 0.3; // 0.4-0.7
  return Math.max(0, (fleschScore / 30) * 0.4); // 0-0.4
}

/**
 * Simplified syllable counting
 */
function countSyllables(word: string): number {
  word = word.toLowerCase();
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
  word = word.replace(/^y/, "");

  const matches = word.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Calculate structure score (paragraphs, lists, formatting)
 */
function calculateStructure(text: string): number {
  if (!text || text.trim().length === 0) return 0;

  let score = 0.3; // Base score

  // Check for paragraph breaks (double newlines)
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  if (paragraphs.length > 1) {
    score += 0.2; // Has multiple paragraphs
  }

  // Check for lists (numbered or bulleted)
  const hasNumberedList = /^\s*\d+[\.\)]\s+.+/m.test(text);
  const hasBulletList = /^\s*[-\*•]\s+.+/m.test(text);
  if (hasNumberedList || hasBulletList) {
    score += 0.2;
  }

  // Check for proper punctuation
  const sentences = tokenizeSentences(text);
  const properlyTerminated = sentences.filter((s) =>
    /[.!?]\s*$/.test(s.trim())
  ).length;
  const punctuationScore = properlyTerminated / sentences.length;
  score += punctuationScore * 0.2;

  // Check for capitalization at sentence starts
  const capitalizedSentences = sentences.filter((s) => {
    const trimmed = s.trim();
    return trimmed.length > 0 && /^[A-Z]/.test(trimmed);
  }).length;
  const capitalizationScore = capitalizedSentences / sentences.length;
  score += capitalizationScore * 0.1;

  return Math.min(1, Math.max(0, score));
}

// ============================================
// STRUCTURAL & FORMAT METRICS
// ============================================

function calculateStructuralMetrics(response: string): StructuralMetrics {
  const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
  const words = response.match(/\b\w+\b/g) || [];
  const paragraphs = response
    .split(/\n\s*\n/)
    .filter((p) => p.trim().length > 0);

  // Basic counts
  const wordCount = words.length;
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;
  const charCount = response.length;

  // Sentence length analysis
  const sentenceLengths = sentences.map(
    (s) => (s.match(/\b\w+\b/g) || []).length
  );
  const avgSentenceLength =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceCount || 0;
  const sentenceLengthVariance = calculateVariance(sentenceLengths);

  // Paragraph distribution
  const paragraphLengths = paragraphs.map(
    (p) => (p.match(/\b\w+\b/g) || []).length
  );
  const avgParagraphLength =
    paragraphLengths.reduce((a, b) => a + b, 0) / paragraphCount || 0;

  // Format detection
  const hasCodeBlocks = /```[\s\S]*?```/.test(response);
  const codeBlockCount = (response.match(/```/g) || []).length / 2;
  const hasBulletPoints = /^\s*[-*•]\s+/m.test(response);
  const bulletPointCount = (response.match(/^\s*[-*•]\s+/gm) || []).length;
  const hasNumberedList = /^\s*\d+\.\s+/m.test(response);
  const numberedListCount = (response.match(/^\s*\d+\.\s+/gm) || []).length;
  const hasHeaders = /^#{1,6}\s+/m.test(response);
  const headerCount = (response.match(/^#{1,6}\s+/gm) || []).length;

  // Structure quality indicators
  const hasIntroduction =
    paragraphCount > 0 &&
    paragraphLengths.length > 0 &&
    (paragraphLengths[0] ?? 0) > 10;
  const hasConclusion =
    paragraphCount > 1 &&
    paragraphLengths.length > 0 &&
    paragraphLengths[paragraphLengths.length - 1]! > 10;

  // Transition words (coherence indicators)
  const transitionWords = [
    "however",
    "therefore",
    "moreover",
    "furthermore",
    "additionally",
    "consequently",
    "nevertheless",
    "meanwhile",
    "similarly",
    "likewise",
    "in contrast",
    "on the other hand",
    "for example",
    "for instance",
  ];
  const transitionWordCount = transitionWords.reduce((count, word) => {
    return (
      count +
      (
        response.toLowerCase().match(new RegExp("\\b" + word + "\\b", "g")) ||
        []
      ).length
    );
  }, 0);
  const transitionWordDensity = transitionWordCount / sentenceCount || 0;

  // Structure score (0-1)
  let structureScore = 0;
  structureScore += paragraphCount > 1 ? 0.2 : 0;
  structureScore +=
    avgSentenceLength >= 10 && avgSentenceLength <= 25 ? 0.2 : 0;
  structureScore += sentenceLengthVariance > 10 ? 0.2 : 0; // Good variance
  structureScore += transitionWordDensity > 0.05 ? 0.2 : 0;
  structureScore += hasIntroduction && hasConclusion ? 0.2 : 0;

  return {
    wordCount,
    sentenceCount,
    paragraphCount,
    charCount,
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(2)),
    sentenceLengthVariance: parseFloat(sentenceLengthVariance.toFixed(2)),
    avgParagraphLength: parseFloat(avgParagraphLength.toFixed(2)),
    formatting: {
      hasCodeBlocks,
      codeBlockCount: Math.floor(codeBlockCount),
      hasBulletPoints,
      bulletPointCount,
      hasNumberedList,
      numberedListCount,
      hasHeaders,
      headerCount,
    },
    structure: {
      hasIntroduction,
      hasConclusion,
      transitionWordCount,
      transitionWordDensity: parseFloat(transitionWordDensity.toFixed(3)),
    },
    structureScore: parseFloat(structureScore.toFixed(2)),
  };
}

// ============================================
// LINGUISTIC QUALITY METRICS
// ============================================

function calculateLinguisticMetrics(response: string): LinguisticMetrics {
  const words = response.toLowerCase().match(/\b\w+\b/g) || [];
  const sentences = response.match(/[^.!?]+[.!?]+/g) || [];

  // Vocabulary diversity (Type-Token Ratio)
  const uniqueWords = new Set(words);
  const typeTokenRatio = uniqueWords.size / words.length || 0;

  // Readability: Flesch Reading Ease
  const totalWords = words.length;
  const totalSentences = sentences.length;
  const totalSyllables = words.reduce(
    (sum, word) => sum + countSyllables(word),
    0
  );

  const fleschScore =
    totalWords > 0 && totalSentences > 0
      ? 206.835 -
        1.015 * (totalWords / totalSentences) -
        84.6 * (totalSyllables / totalWords)
      : 0;

  // Repetition detection (2-gram and 3-gram overlap)
  const bigrams: string[] = [];
  const trigrams: string[] = [];
  for (let i = 0; i < words.length - 1; i++) {
    bigrams.push(words[i] + " " + words[i + 1]);
  }
  for (let i = 0; i < words.length - 2; i++) {
    trigrams.push(words[i] + " " + words[i + 1] + " " + words[i + 2]);
  }

  const bigramRepetition = 1 - (new Set(bigrams).size / bigrams.length || 1);
  const trigramRepetition = 1 - (new Set(trigrams).size / trigrams.length || 1);

  // Hedge words (uncertainty indicators)
  const hedgeWords = [
    "maybe",
    "perhaps",
    "possibly",
    "probably",
    "might",
    "could",
    "may",
    "seem",
    "appear",
    "likely",
    "unlikely",
    "potentially",
  ];
  const hedgeWordCount = hedgeWords.reduce((count, word) => {
    return count + words.filter((w) => w === word).length;
  }, 0);
  const hedgeWordDensity = hedgeWordCount / totalWords || 0;

  // Filler words
  const fillerWords = [
    "very",
    "really",
    "quite",
    "just",
    "actually",
    "basically",
  ];
  const fillerWordCount = fillerWords.reduce((count, word) => {
    return count + words.filter((w) => w === word).length;
  }, 0);
  const fillerWordDensity = fillerWordCount / totalWords || 0;

  // Complex words (3+ syllables)
  const complexWords = words.filter((word) => countSyllables(word) >= 3);
  const complexWordRatio = complexWords.length / totalWords || 0;

  // Linguistic quality score (0-1)
  let linguisticScore = 0;
  linguisticScore +=
    typeTokenRatio > 0.4 ? 0.25 : typeTokenRatio > 0.3 ? 0.15 : 0;
  linguisticScore += fleschScore >= 30 && fleschScore <= 70 ? 0.25 : 0;
  linguisticScore += bigramRepetition < 0.1 ? 0.25 : 0;
  linguisticScore += hedgeWordDensity < 0.02 ? 0.25 : 0;

  return {
    vocabularyDiversity: {
      uniqueWords: uniqueWords.size,
      totalWords,
      typeTokenRatio: parseFloat(typeTokenRatio.toFixed(3)),
    },
    readability: {
      fleschReadingEase: parseFloat(fleschScore.toFixed(2)),
      interpretation: interpretFleschScore(fleschScore),
      avgSyllablesPerWord: parseFloat(
        (totalSyllables / totalWords || 0).toFixed(2)
      ),
      complexWordRatio: parseFloat(complexWordRatio.toFixed(3)),
    },
    repetition: {
      bigramRepetition: parseFloat(bigramRepetition.toFixed(3)),
      trigramRepetition: parseFloat(trigramRepetition.toFixed(3)),
    },
    wordQuality: {
      hedgeWordCount,
      hedgeWordDensity: parseFloat(hedgeWordDensity.toFixed(4)),
      fillerWordCount,
      fillerWordDensity: parseFloat(fillerWordDensity.toFixed(4)),
    },
    linguisticScore: parseFloat(linguisticScore.toFixed(2)),
  };
}

// ============================================
// KEYWORD PRESENCE & RELEVANCE
// ============================================

function calculateKeywordRelevance(
  prompt: string,
  response: string
): RelevanceMetrics {
  const promptWords = prompt.toLowerCase().match(/\b\w+\b/g) || [];
  const responseWords = response.toLowerCase().match(/\b\w+\b/g) || [];

  // Remove stop words
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "as",
    "is",
    "was",
    "are",
    "were",
    "been",
    "be",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "which",
    "who",
    "when",
    "where",
    "why",
    "how",
  ]);

  const promptKeywords = promptWords.filter(
    (w) => !stopWords.has(w) && w.length > 2
  );
  const responseWordsFiltered = responseWords.filter(
    (w) => !stopWords.has(w) && w.length > 2
  );

  // Extract important keywords (appearing in prompt)
  const uniquePromptKeywords = [...new Set(promptKeywords)];

  // Count keyword mentions in response
  const keywordMatches = uniquePromptKeywords.map((keyword) => {
    const count = responseWordsFiltered.filter((w) => w === keyword).length;
    return { keyword, count, present: count > 0 };
  });

  const keywordsPresent = keywordMatches.filter((k) => k.present).length;
  const keywordCoverage = keywordsPresent / uniquePromptKeywords.length || 0;

  // Early keyword presence (in first 100 words)
  const earlyResponseWords = responseWordsFiltered.slice(0, 100);
  const earlyKeywordMatches = uniquePromptKeywords.filter((kw) =>
    earlyResponseWords.includes(kw)
  ).length;
  const earlyKeywordRatio =
    earlyKeywordMatches / uniquePromptKeywords.length || 0;

  // Keyword density (not too spammy)
  const totalKeywordMentions = keywordMatches.reduce(
    (sum, k) => sum + k.count,
    0
  );
  const keywordDensity =
    totalKeywordMentions / responseWordsFiltered.length || 0;

  // Relevance score (0-1)
  let relevanceScore = 0;
  relevanceScore += keywordCoverage > 0.5 ? 0.3 : keywordCoverage * 0.6;
  relevanceScore += earlyKeywordRatio > 0.3 ? 0.3 : earlyKeywordRatio;
  relevanceScore += keywordDensity > 0.02 && keywordDensity < 0.15 ? 0.2 : 0;
  relevanceScore += totalKeywordMentions > 0 ? 0.2 : 0;

  return {
    promptKeywords: uniquePromptKeywords,
    keywordMatches: keywordMatches.filter((k) => k.present),
    keywordCoverage: parseFloat(keywordCoverage.toFixed(2)),
    earlyKeywordPresence: parseFloat(earlyKeywordRatio.toFixed(2)),
    keywordDensity: parseFloat(keywordDensity.toFixed(4)),
    totalKeywordMentions,
    relevanceScore: parseFloat(relevanceScore.toFixed(2)),
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateVariance(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  const squareDiffs = numbers.map((n) => Math.pow(n - mean, 2));
  return squareDiffs.reduce((a, b) => a + b, 0) / numbers.length;
}

function interpretFleschScore(score: number): string {
  if (score >= 90) return "Very Easy";
  if (score >= 80) return "Easy";
  if (score >= 70) return "Fairly Easy";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly Difficult";
  if (score >= 30) return "Difficult";
  return "Very Difficult";
}

function generateSummary(
  structural: StructuralMetrics,
  linguistic: LinguisticMetrics,
  relevance: RelevanceMetrics | null,
  overallScore: number
): string[] {
  const insights: string[] = [];

  if (overallScore >= 0.8) insights.push("Excellent response quality");
  else if (overallScore >= 0.6) insights.push("Good response quality");
  else if (overallScore >= 0.4) insights.push("Moderate response quality");
  else insights.push("Response needs improvement");

  if (relevance) {
    if (relevance.keywordCoverage < 0.3)
      insights.push("Low keyword coverage - may not address prompt");
  }
  if (linguistic.repetition.bigramRepetition > 0.15)
    insights.push("High repetition detected");
  if (structural.avgSentenceLength > 30)
    insights.push("Sentences are very long");
  if (linguistic.wordQuality.hedgeWordDensity > 0.03)
    insights.push("High uncertainty in language");
  if (structural.paragraphCount === 1)
    insights.push("Consider adding paragraph breaks");

  return insights;
}
