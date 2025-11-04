import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Response } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

type ResponseCardProps = {
  response: Response;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
};

export const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md"
      onClick={() => onSelect?.(response.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Parameters</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Temp: {response.temperature.toFixed(2)}
              </span>
              <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Top P: {response.topP.toFixed(2)}
              </span>
              {response.topK && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Top K: {response.topK}
                </span>
              )}
              {response.maxTokens && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Max Tokens: {response.maxTokens}
                </span>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="ml-2 flex-shrink-0">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">
                ✓
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {response.metrics && (
          <>
            {/* Overall Score */}
            <div className="bg-indigo-50 rounded-lg p-3 text-center">
              <div className="text-xs text-gray-600 mb-1">Overall Score</div>
              <div className="text-2xl font-bold text-indigo-600">
                {(response.metrics.overallScore * 100).toFixed(1)}%
              </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-md p-2 text-center">
                <div className="text-xs text-gray-500">Coherence</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(response.metrics.coherenceScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-2 text-center">
                <div className="text-xs text-gray-500">Completeness</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(response.metrics.completenessScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-2 text-center">
                <div className="text-xs text-gray-500">Readability</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(response.metrics.readabilityScore * 100).toFixed(1)}%
                </div>
              </div>
              <div className="bg-gray-50 rounded-md p-2 text-center">
                <div className="text-xs text-gray-500">Structure</div>
                <div className="text-sm font-semibold text-gray-900">
                  {(response.metrics.structureScore * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Detailed Metrics Stats */}
            {response.metrics.detailedMetrics && (
              <>
                <div className="border-t pt-3">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Words</div>
                      <div className="font-semibold text-gray-900">
                        {response.metrics.detailedMetrics.structural.wordCount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Sentences</div>
                      <div className="font-semibold text-gray-900">
                        {
                          response.metrics.detailedMetrics.structural
                            .sentenceCount
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Paragraphs</div>
                      <div className="font-semibold text-gray-900">
                        {
                          response.metrics.detailedMetrics.structural
                            .paragraphCount
                        }
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Keywords</div>
                      <div className="font-semibold text-gray-900">
                        {(
                          response.metrics.detailedMetrics.relevance
                            .keywordCoverage * 100
                        ).toFixed(0)}
                        %
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 rounded-md p-2">
                    <div className="text-gray-600 mb-1">Flesch Reading</div>
                    <div className="font-semibold text-blue-700">
                      {response.metrics.detailedMetrics.linguistic.readability.fleschReadingEase.toFixed(
                        1
                      )}
                    </div>
                    <div className="text-xs text-blue-600">
                      {
                        response.metrics.detailedMetrics.linguistic.readability
                          .interpretation
                      }
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-md p-2">
                    <div className="text-gray-600 mb-1">Vocab Diversity</div>
                    <div className="font-semibold text-green-700">
                      {(
                        response.metrics.detailedMetrics.linguistic
                          .vocabularyDiversity.typeTokenRatio * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-green-600">
                      {
                        response.metrics.detailedMetrics.linguistic
                          .vocabularyDiversity.uniqueWords
                      }{" "}
                      unique
                    </div>
                  </div>
                </div>

                {/* Repetition & Word Quality */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-yellow-50 rounded-md p-2">
                    <div className="text-gray-600 mb-1">Repetition</div>
                    <div
                      className={`font-semibold ${
                        response.metrics.detailedMetrics.linguistic.repetition
                          .bigramRepetition > 0.15
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {(
                        response.metrics.detailedMetrics.linguistic.repetition
                          .bigramRepetition * 100
                      ).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-md p-2">
                    <div className="text-gray-600 mb-1">Relevance</div>
                    <div className="font-semibold text-purple-700">
                      {(
                        response.metrics.detailedMetrics.relevance
                          .relevanceScore * 100
                      ).toFixed(1)}
                      %
                    </div>
                    <div className="text-xs text-purple-600">
                      {
                        response.metrics.detailedMetrics.relevance
                          .keywordMatches.length
                      }{" "}
                      keywords matched
                    </div>
                  </div>
                </div>

                {/* Formatting Indicators */}
                {response.metrics.detailedMetrics.structural.formatting
                  .hasCodeBlocks ||
                response.metrics.detailedMetrics.structural.formatting
                  .hasBulletPoints ||
                response.metrics.detailedMetrics.structural.formatting
                  .hasNumberedList ||
                response.metrics.detailedMetrics.structural.formatting
                  .hasHeaders ? (
                  <div className="flex flex-wrap gap-2">
                    {response.metrics.detailedMetrics.structural.formatting
                      .hasCodeBlocks && (
                      <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        Code Blocks (
                        {
                          response.metrics.detailedMetrics.structural.formatting
                            .codeBlockCount
                        }
                        )
                      </span>
                    )}
                    {response.metrics.detailedMetrics.structural.formatting
                      .hasBulletPoints && (
                      <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                        Bullets (
                        {
                          response.metrics.detailedMetrics.structural.formatting
                            .bulletPointCount
                        }
                        )
                      </span>
                    )}
                    {response.metrics.detailedMetrics.structural.formatting
                      .hasNumberedList && (
                      <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        Numbered (
                        {
                          response.metrics.detailedMetrics.structural.formatting
                            .numberedListCount
                        }
                        )
                      </span>
                    )}
                    {response.metrics.detailedMetrics.structural.formatting
                      .hasHeaders && (
                      <span className="inline-flex items-center rounded-md bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800">
                        Headers (
                        {
                          response.metrics.detailedMetrics.structural.formatting
                            .headerCount
                        }
                        )
                      </span>
                    )}
                  </div>
                ) : null}

                {/* Summary Insights */}
                {response.metrics.detailedMetrics.summary.length > 0 && (
                  <div className="bg-gray-50 rounded-md p-2">
                    <div className="text-xs font-semibold text-gray-700 mb-1">
                      Insights
                    </div>
                    <div className="space-y-1">
                      {response.metrics.detailedMetrics.summary
                        .slice(0, 2)
                        .map((insight, idx) => (
                          <div
                            key={idx}
                            className="text-xs text-gray-600 flex items-start"
                          >
                            <span className="mr-1">•</span>
                            <span>{insight}</span>
                          </div>
                        ))}
                      {response.metrics.detailedMetrics.summary.length > 2 && (
                        <div className="text-xs text-gray-500 italic">
                          +{response.metrics.detailedMetrics.summary.length - 2}{" "}
                          more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Response</h4>
          <div className="bg-gray-50 rounded-md p-4 max-h-60 overflow-y-auto">
            <p className="text-sm text-gray-800 whitespace-pre-wrap">
              {response.content}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {formatDistanceToNow(new Date(response.createdAt), {
            addSuffix: true,
          })}
        </div>
      </CardContent>
    </Card>
  );
};
