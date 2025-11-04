import React, { useState } from "react";
import { useRouter } from "next/router";
import { useExperiment } from "@/lib/hooks";
import { ResponseCard } from "@/components/experiment/ResponseCard";
import { ComparisonView } from "@/components/experiment/ComparisonView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterInputsGrid } from "@/components/experiment/ParameterInputsGrid";
import { ParameterValidation } from "@/components/experiment/ParameterValidation";
import { ProgressBar } from "@/components/experiment/ProgressBar";
import { LoadingSpinner } from "@/components/ui/loading";
import { MetricsChart } from "@/components/experiment/MetricsChart";
import { Response } from "@/lib/api";
import { DEFAULT_PARAMETER_RANGES } from "@/lib/constants";
import {
  useParameterValidation,
  useGenerateResponses,
  useExportExperiment,
} from "@/lib/hooks";
import { extractErrorMessage } from "@/lib/utils/errorHandling";

export default function ExperimentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const experimentId = id as string;

  const { data: experiment, isLoading, error } = useExperiment(experimentId);
  const generateMutation = useGenerateResponses();
  const exportMutation = useExportExperiment();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [parameterRanges, setParameterRanges] = useState(
    DEFAULT_PARAMETER_RANGES
  );

  const { isValid, missingParams } = useParameterValidation(parameterRanges);

  const handleSelectResponse = (responseId: string) => {
    setSelectedIds((prev) =>
      prev.includes(responseId)
        ? prev.filter((id) => id !== responseId)
        : [...prev, responseId]
    );
  };

  const handleGenerate = async () => {
    if (!experimentId) return;

    if (!isValid) {
      alert(
        `The following parameter ranges are required but missing:\n${missingParams.join(
          ", "
        )}\n\nPlease provide values for all parameters.`
      );
      return;
    }

    try {
      await generateMutation.mutateAsync({
        experimentId,
        parameterRanges,
      });
      setShowGenerateForm(false);
    } catch (error: any) {
      console.error("Failed to generate responses:", error);
      alert(extractErrorMessage(error));
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    if (!experimentId) return;

    try {
      const result = (await exportMutation.mutateAsync({
        experimentId,
        format,
      })) as { data: any };

      const blob =
        format === "json"
          ? new Blob([JSON.stringify(result.data, null, 2)], {
              type: "application/json",
            })
          : new Blob([result.data], { type: "text/csv" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `experiment-${experimentId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export:", error);
      alert("Failed to export experiment. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading experiment..." />
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-red-600 mb-6 text-lg">
              Failed to load experiment. Please try again.
            </p>
            <Button onClick={() => router.push("/")} size="lg">
              ← Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const responseCount = experiment.responses?.length || 0;
  const avgScore =
    responseCount > 0
      ? (
          experiment.responses!.reduce(
            (sum: number, r: Response) => sum + (r.metrics?.overallScore || 0),
            0
          ) / responseCount
        ).toFixed(2)
      : "0.00";
  const highQualityCount =
    experiment.responses?.filter(
      (r: Response) => r.metrics?.overallScore && r.metrics.overallScore > 0.7
    ).length || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back
            </Button>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                title={showSidebar ? "Hide sidebar" : "Show sidebar"}
              >
                {showSidebar ? "☰" : "☰"}
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("json")}
                  disabled={exportMutation.isPending}
                  className="hidden sm:flex"
                >
                  Export JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("csv")}
                  disabled={exportMutation.isPending}
                  className="hidden sm:flex"
                >
                  Export CSV
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          {showSidebar && (
            <aside className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Experiment Info Card */}
                <Card className="shadow-lg border-2 border-indigo-100">
                  <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                    <CardTitle className="text-xl flex items-center justify-between">
                      <span>Experiment</span>
                      <span className="text-xs font-normal bg-indigo-600 text-white px-2 py-1 rounded-full">
                        {responseCount}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">
                          Prompt
                        </label>
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                            {experiment.prompt}
                          </p>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      {responseCount > 0 && (
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Average Score
                            </span>
                            <span className="text-lg font-bold text-indigo-600">
                              {avgScore}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              High Quality
                            </span>
                            <span className="text-lg font-bold text-green-600">
                              {highQualityCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              Selected
                            </span>
                            <span className="text-lg font-bold text-purple-600">
                              {selectedIds.length}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 border-t border-gray-200 space-y-2">
                        <Button
                          onClick={() => setShowGenerateForm(!showGenerateForm)}
                          className="w-full"
                          variant={showGenerateForm ? "default" : "outline"}
                          size="sm"
                        >
                          {showGenerateForm
                            ? "✕ Hide Generator"
                            : "➕ Generate"}
                        </Button>
                        {selectedIds.length > 0 && (
                          <>
                            <Button
                              onClick={() => {
                                // Scroll to comparison
                                document
                                  .getElementById("comparison-view")
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className="w-full"
                              size="sm"
                            >
                              🔍 Compare ({selectedIds.length})
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setSelectedIds([])}
                              className="w-full"
                              size="sm"
                            >
                              Clear Selection
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Metrics Summary */}
                {responseCount > 0 && (
                  <Card className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <ProgressBar
                          label="Overall Quality"
                          value={parseFloat(avgScore)}
                          max={1}
                          color="indigo"
                        />
                        <ProgressBar
                          label="High Quality Rate"
                          value={(highQualityCount / responseCount) * 100}
                          max={100}
                          color="green"
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </aside>
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Generate Form - Collapsible */}
            {showGenerateForm && (
              <Card className="mb-8 shadow-xl border-2 border-indigo-200 animate-in slide-in-from-top-2">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <span>⚙️</span>
                      Generate New Responses
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowGenerateForm(false)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-6">
                    <ParameterInputsGrid
                      parameterRanges={parameterRanges}
                      onChange={setParameterRanges}
                    />
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={generateMutation.isPending || !isValid}
                    className="w-full"
                    size="lg"
                  >
                    {generateMutation.isPending ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Generating...
                      </>
                    ) : (
                      <>🚀 Generate Responses</>
                    )}
                  </Button>

                  <ParameterValidation parameterRanges={parameterRanges} />
                </CardContent>
              </Card>
            )}

            {/* Loading Indicator */}
            {generateMutation.isPending && (
              <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        Generating responses...
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        This may take a while. Please don't close this page.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Metrics Chart */}
            {responseCount > 0 && (
              <Card className="mb-8 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">📊 Metrics Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <MetricsChart responses={experiment.responses!} />
                </CardContent>
              </Card>
            )}

            {/* Comparison View */}
            {selectedIds.length > 0 && (
              <div id="comparison-view" className="mb-8">
                <Card className="shadow-lg border-2 border-purple-200">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2">
                        🔍 Comparison View
                        <span className="text-sm font-normal bg-purple-600 text-white px-2 py-1 rounded-full">
                          {selectedIds.length}
                        </span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedIds([])}
                      >
                        Clear Selection
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ComparisonView
                      responses={experiment.responses!}
                      selectedIds={selectedIds}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Responses Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Responses
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {responseCount > 0
                      ? `Click on responses to select them for comparison`
                      : `Generate responses to get started`}
                  </p>
                </div>
                {selectedIds.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedIds.length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        document
                          .getElementById("comparison-view")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      View Comparison
                    </Button>
                  </div>
                )}
              </div>

              {responseCount === 0 ? (
                <Card className="shadow-lg border-2 border-dashed border-gray-300">
                  <CardContent className="p-16 text-center">
                    <div className="text-7xl mb-6">✨</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      Ready to Generate Responses
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                      Configure your parameter ranges and generate responses to
                      start analyzing and comparing different LLM outputs.
                    </p>
                    <Button
                      onClick={() => setShowGenerateForm(true)}
                      size="lg"
                      className="px-8"
                    >
                      ➕ Generate Your First Responses
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {experiment.responses!.map((response: Response) => (
                    <div
                      key={response.id}
                      className={`transition-all duration-200 ${
                        selectedIds.includes(response.id)
                          ? "scale-[1.02]"
                          : "hover:shadow-xl hover:scale-[1.01]"
                      }`}
                    >
                      <ResponseCard
                        response={response}
                        isSelected={selectedIds.includes(response.id)}
                        onSelect={handleSelectResponse}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Action Button for Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <div className="flex flex-col gap-3">
          {selectedIds.length > 0 && (
            <Button
              onClick={() => {
                document
                  .getElementById("comparison-view")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-full shadow-2xl h-14 w-14 p-0"
              size="lg"
            >
              🔍
            </Button>
          )}
          <Button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="rounded-full shadow-2xl h-14 w-14 p-0 text-2xl"
            size="lg"
          >
            {showGenerateForm ? "✕" : "➕"}
          </Button>
        </div>
      </div>
    </div>
  );
}
