import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Response } from "@/lib/api";

type ComparisonViewProps = {
  responses: Response[];
  selectedIds: string[];
};

type ResponseWithIndex = Response & { originalIndex: number };

const MetricRow: React.FC<{
  label: string;
  values: (number | string)[];
  format?: "percentage" | "number" | "text";
  highlightBest?: boolean;
}> = ({ label, values, format = "number", highlightBest = false }) => {
  let bestIndex = -1;
  if (highlightBest && format === "percentage" && values.length > 0) {
    const numericValues = values.map((v) =>
      typeof v === "number" ? v : parseFloat(v as string)
    );
    bestIndex = numericValues.indexOf(Math.max(...numericValues));
  }

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3 font-medium text-gray-700 bg-gray-50 sticky left-0 z-10">
        {label}
      </td>
      {values.map((value, idx) => (
        <td
          key={idx}
          className={`px-4 py-3 text-center ${
            highlightBest && idx === bestIndex && format === "percentage"
              ? "bg-green-50 font-semibold text-green-700"
              : ""
          }`}
        >
          {format === "percentage" && typeof value === "number"
            ? `${(value * 100).toFixed(1)}%`
            : format === "number" && typeof value === "number"
            ? value.toFixed(2)
            : value}
        </td>
      ))}
    </tr>
  );
};

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  responses,
  selectedIds,
}) => {
  // Maintain the selection order and map to original response index
  const selectedResponses: ResponseWithIndex[] = selectedIds
    .map((id) => {
      const response = responses.find((r) => r.id === id);
      const originalIndex = responses.findIndex((r) => r.id === id);
      return response
        ? { ...response, originalIndex: originalIndex + 1 }
        : null;
    })
    .filter((r): r is ResponseWithIndex => r !== null);

  if (selectedResponses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          Select at least one response to compare
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Parameters Comparison Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100">
          <CardTitle className="text-lg">⚙️ Parameters Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20">
                    Parameter
                  </th>
                  {selectedResponses.map((response) => (
                    <th
                      key={response.id}
                      className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px] bg-gray-100"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xs text-gray-500">
                          Response #{response.originalIndex}
                        </span>
                        <div className="text-xs space-y-0.5">
                          <div>T: {response.temperature.toFixed(2)}</div>
                          <div>P: {response.topP.toFixed(2)}</div>
                          {response.topK && <div>K: {response.topK}</div>}
                          {response.maxTokens && (
                            <div>Tokens: {response.maxTokens}</div>
                          )}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <MetricRow
                  label="Temperature"
                  values={selectedResponses.map((r) => r.temperature)}
                  format="number"
                />
                <MetricRow
                  label="Top P"
                  values={selectedResponses.map((r) => r.topP)}
                  format="number"
                />
                <MetricRow
                  label="Top K"
                  values={selectedResponses.map((r) => r.topK ?? "N/A")}
                  format="text"
                />
                <MetricRow
                  label="Max Tokens"
                  values={selectedResponses.map((r) => r.maxTokens ?? "N/A")}
                  format="text"
                />
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Core Metrics Comparison */}
      {selectedResponses.some((r) => r.metrics) && (
        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
            <CardTitle className="text-lg">📊 Core Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 border-b-2 border-gray-300">
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20">
                      Metric
                    </th>
                    {selectedResponses.map((response) => (
                      <th
                        key={response.id}
                        className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px] bg-gray-100"
                      >
                        Response #{response.originalIndex}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <MetricRow
                    label="Overall Score"
                    values={selectedResponses.map(
                      (r) => r.metrics?.overallScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                  <MetricRow
                    label="Coherence"
                    values={selectedResponses.map(
                      (r) => r.metrics?.coherenceScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                  <MetricRow
                    label="Completeness"
                    values={selectedResponses.map(
                      (r) => r.metrics?.completenessScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                  <MetricRow
                    label="Readability"
                    values={selectedResponses.map(
                      (r) => r.metrics?.readabilityScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                  <MetricRow
                    label="Structure"
                    values={selectedResponses.map(
                      (r) => r.metrics?.structureScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                  <MetricRow
                    label="Length Appropriateness"
                    values={selectedResponses.map(
                      (r) => r.metrics?.lengthScore ?? 0
                    )}
                    format="percentage"
                    highlightBest
                  />
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Metrics Comparison */}
      {selectedResponses.some((r) => r.metrics?.detailedMetrics) && (
        <>
          {/* Structural Metrics */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="text-lg">🏗️ Structural Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20">
                        Metric
                      </th>
                      {selectedResponses.map((response) => (
                        <th
                          key={response.id}
                          className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px] bg-gray-100"
                        >
                          Response #{response.originalIndex}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <MetricRow
                      label="Word Count"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural.wordCount ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Sentence Count"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural
                            .sentenceCount ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Paragraph Count"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural
                            .paragraphCount ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Avg Sentence Length"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural
                            .avgSentenceLength ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Structure Score"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural
                            .structureScore ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                    <MetricRow
                      label="Code Blocks"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural.formatting
                            .codeBlockCount ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Bullet Points"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural.formatting
                            .bulletPointCount ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Headers"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.structural.formatting
                            .headerCount ?? 0
                      )}
                      format="number"
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Linguistic Metrics */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <CardTitle className="text-lg">📚 Linguistic Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20">
                        Metric
                      </th>
                      {selectedResponses.map((response) => (
                        <th
                          key={response.id}
                          className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px] bg-gray-100"
                        >
                          Response #{response.originalIndex}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <MetricRow
                      label="Vocabulary Diversity (TTR)"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic
                            .vocabularyDiversity.typeTokenRatio ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                    <MetricRow
                      label="Unique Words"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic
                            .vocabularyDiversity.uniqueWords ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Flesch Reading Ease"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic.readability
                            .fleschReadingEase ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Readability Level"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic.readability
                            .interpretation ?? "N/A"
                      )}
                      format="text"
                    />
                    <MetricRow
                      label="Bigram Repetition"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic.repetition
                            .bigramRepetition ?? 0
                      )}
                      format="percentage"
                    />
                    <MetricRow
                      label="Hedge Word Density"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic.wordQuality
                            .hedgeWordDensity ?? 0
                      )}
                      format="percentage"
                    />
                    <MetricRow
                      label="Linguistic Score"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.linguistic
                            .linguisticScore ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Relevance Metrics */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-100">
              <CardTitle className="text-lg">🎯 Relevance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 sticky left-0 bg-gray-100 z-20">
                        Metric
                      </th>
                      {selectedResponses.map((response) => (
                        <th
                          key={response.id}
                          className="px-4 py-3 text-center font-semibold text-gray-700 min-w-[200px] bg-gray-100"
                        >
                          Response #{response.originalIndex}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <MetricRow
                      label="Keyword Coverage"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.relevance
                            .keywordCoverage ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                    <MetricRow
                      label="Early Keyword Presence"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.relevance
                            .earlyKeywordPresence ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                    <MetricRow
                      label="Keyword Density"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.relevance
                            .keywordDensity ?? 0
                      )}
                      format="percentage"
                    />
                    <MetricRow
                      label="Matched Keywords"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.relevance.keywordMatches
                            .length ?? 0
                      )}
                      format="number"
                    />
                    <MetricRow
                      label="Relevance Score"
                      values={selectedResponses.map(
                        (r) =>
                          r.metrics?.detailedMetrics?.relevance
                            .relevanceScore ?? 0
                      )}
                      format="percentage"
                      highlightBest
                    />
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Response Content Comparison */}
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
          <CardTitle className="text-lg">📝 Response Content</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedResponses.map((response) => (
              <div
                key={response.id}
                className="border-2 border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-indigo-900">
                      Response #{response.originalIndex}
                    </span>
                    {response.metrics && (
                      <span className="text-xs bg-indigo-600 text-white px-2 py-1 rounded-full">
                        {(response.metrics.overallScore * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-white max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {response.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
