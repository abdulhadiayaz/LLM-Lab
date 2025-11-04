import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DetailedMetrics } from "@/lib/api";

type DetailedMetricsDisplayProps = {
  metrics: DetailedMetrics;
};

export const DetailedMetricsDisplay: React.FC<DetailedMetricsDisplayProps> = ({
  metrics,
}) => {
  const [activeTab, setActiveTab] = useState<
    "structural" | "linguistic" | "relevance"
  >("structural");

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Detailed Metrics Analysis</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={activeTab === "structural" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("structural")}
            >
              Structural
            </Button>
            <Button
              variant={activeTab === "linguistic" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("linguistic")}
            >
              Linguistic
            </Button>
            <Button
              variant={activeTab === "relevance" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("relevance")}
            >
              Relevance
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Section */}
        {metrics.summary.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Key Insights</h3>
            <ul className="space-y-1">
              {metrics.summary.map((insight, index) => (
                <li
                  key={index}
                  className="text-sm text-blue-800 flex items-start"
                >
                  <span className="mr-2">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Structural Metrics */}
        {activeTab === "structural" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricBox
                label="Words"
                value={metrics.structural.wordCount.toLocaleString()}
              />
              <MetricBox
                label="Sentences"
                value={metrics.structural.sentenceCount.toString()}
              />
              <MetricBox
                label="Paragraphs"
                value={metrics.structural.paragraphCount.toString()}
              />
              <MetricBox
                label="Characters"
                value={metrics.structural.charCount.toLocaleString()}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Sentence Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Length:</span>
                    <span className="font-medium">
                      {metrics.structural.avgSentenceLength.toFixed(1)} words
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variance:</span>
                    <span className="font-medium">
                      {metrics.structural.sentenceLengthVariance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Paragraph Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Length:</span>
                    <span className="font-medium">
                      {metrics.structural.avgParagraphLength.toFixed(1)} words
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Structure Score:</span>
                    <span className="font-medium">
                      {(metrics.structural.structureScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">Formatting</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <FormatBadge
                  label="Code Blocks"
                  value={metrics.structural.formatting.codeBlockCount}
                  active={metrics.structural.formatting.hasCodeBlocks}
                />
                <FormatBadge
                  label="Bullet Points"
                  value={metrics.structural.formatting.bulletPointCount}
                  active={metrics.structural.formatting.hasBulletPoints}
                />
                <FormatBadge
                  label="Numbered Lists"
                  value={metrics.structural.formatting.numberedListCount}
                  active={metrics.structural.formatting.hasNumberedList}
                />
                <FormatBadge
                  label="Headers"
                  value={metrics.structural.formatting.headerCount}
                  active={metrics.structural.formatting.hasHeaders}
                />
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">
                Structure Quality
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">Introduction:</span>
                    {metrics.structural.structure.hasIntroduction ? (
                      <span className="text-green-600 font-medium">
                        ✓ Present
                      </span>
                    ) : (
                      <span className="text-gray-400">✗ Missing</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Conclusion:</span>
                    {metrics.structural.structure.hasConclusion ? (
                      <span className="text-green-600 font-medium">
                        ✓ Present
                      </span>
                    ) : (
                      <span className="text-gray-400">✗ Missing</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Transition Words:</span>
                    <span className="font-medium">
                      {metrics.structural.structure.transitionWordCount}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Density:</span>
                    <span className="font-medium">
                      {(
                        metrics.structural.structure.transitionWordDensity * 100
                      ).toFixed(2)}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Linguistic Metrics */}
        {activeTab === "linguistic" && (
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-semibold text-indigo-900 mb-3">
                Vocabulary Diversity
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Unique Words</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {metrics.linguistic.vocabularyDiversity.uniqueWords}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Total Words</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {metrics.linguistic.vocabularyDiversity.totalWords}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Type-Token Ratio</div>
                  <div className="text-2xl font-bold text-indigo-600">
                    {(
                      metrics.linguistic.vocabularyDiversity.typeTokenRatio *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3">Readability</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">
                    Flesch Reading Ease
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {metrics.linguistic.readability.fleschReadingEase.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm text-green-700 mt-1">
                    {metrics.linguistic.readability.interpretation}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Syllables/Word:</span>
                    <span className="font-medium">
                      {metrics.linguistic.readability.avgSyllablesPerWord.toFixed(
                        2
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Complex Word Ratio:</span>
                    <span className="font-medium">
                      {(
                        metrics.linguistic.readability.complexWordRatio * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Linguistic Score:</span>
                    <span className="font-medium">
                      {(metrics.linguistic.linguisticScore * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Repetition Analysis
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bigram Repetition:</span>
                    <span
                      className={`font-medium ${
                        metrics.linguistic.repetition.bigramRepetition > 0.15
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(
                        metrics.linguistic.repetition.bigramRepetition * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trigram Repetition:</span>
                    <span
                      className={`font-medium ${
                        metrics.linguistic.repetition.trigramRepetition > 0.15
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(
                        metrics.linguistic.repetition.trigramRepetition * 100
                      ).toFixed(1)}
                      %
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Word Quality
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hedge Words:</span>
                    <span className="font-medium">
                      {metrics.linguistic.wordQuality.hedgeWordCount}
                    </span>
                    <span className="text-gray-500">
                      (
                      {(
                        metrics.linguistic.wordQuality.hedgeWordDensity * 100
                      ).toFixed(2)}
                      %)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Filler Words:</span>
                    <span className="font-medium">
                      {metrics.linguistic.wordQuality.fillerWordCount}
                    </span>
                    <span className="text-gray-500">
                      (
                      {(
                        metrics.linguistic.wordQuality.fillerWordDensity * 100
                      ).toFixed(2)}
                      %)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Relevance Metrics */}
        {activeTab === "relevance" && (
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-3">
                Keyword Relevance
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Coverage</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(metrics.relevance.keywordCoverage * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Early Presence</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(metrics.relevance.earlyKeywordPresence * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Density</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(metrics.relevance.keywordDensity * 100).toFixed(2)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Relevance Score</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {(metrics.relevance.relevanceScore * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3">
                Prompt Keywords
              </h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {metrics.relevance.promptKeywords
                  .slice(0, 20)
                  .map((keyword, index) => {
                    const match = metrics.relevance.keywordMatches.find(
                      (m) => m.keyword === keyword
                    );
                    return (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${
                          match?.present
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {keyword}
                        {match && match.count > 1 && (
                          <span className="ml-1 text-green-600">
                            ×{match.count}
                          </span>
                        )}
                      </span>
                    );
                  })}
                {metrics.relevance.promptKeywords.length > 20 && (
                  <span className="text-xs text-gray-500">
                    +{metrics.relevance.promptKeywords.length - 20} more
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Total keyword mentions:{" "}
                <span className="font-medium">
                  {metrics.relevance.totalKeywordMentions}
                </span>
              </div>
            </div>

            {metrics.relevance.keywordMatches.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-3">
                  Matched Keywords
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  {metrics.relevance.keywordMatches.map((match, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 rounded px-2 py-1 flex justify-between items-center"
                    >
                      <span className="font-medium text-green-800">
                        {match.keyword}
                      </span>
                      <span className="text-green-600 font-bold">
                        ×{match.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MetricBox: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
};

const FormatBadge: React.FC<{
  label: string;
  value: number;
  active: boolean;
}> = ({ label, value, active }) => {
  return (
    <div
      className={`rounded-md p-2 text-center ${
        active ? "bg-green-100 border border-green-300" : "bg-gray-100"
      }`}
    >
      <div className="text-xs font-medium text-gray-700">{label}</div>
      <div
        className={`text-lg font-bold ${
          active ? "text-green-700" : "text-gray-400"
        }`}
      >
        {value}
      </div>
    </div>
  );
};
