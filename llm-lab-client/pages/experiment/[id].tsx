import React, { useState } from "react";
import { useRouter } from "next/router";
import { useExperiment } from "@/lib/hooks";
import { ComparisonView } from "@/components/experiment/ComparisonView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading";
import { MetricsChart } from "@/components/experiment/MetricsChart";
import { DEFAULT_PARAMETER_RANGES } from "@/lib/constants";
import {
  useParameterValidation,
  useGenerateResponses,
  useExportExperiment,
} from "@/lib/hooks";
import { extractErrorMessage } from "@/lib/utils/errorHandling";
import { ExperimentNavigation } from "@/components/experiment/ExperimentNavigation";
import { ExperimentSidebar } from "@/components/experiment/ExperimentSidebar";
import { GenerateResponseForm } from "@/components/experiment/GenerateResponseForm";
import { GeneratingIndicator } from "@/components/experiment/GeneratingIndicator";
import { ResponsesList } from "@/components/experiment/ResponsesList";
import { MobileFloatingActions } from "@/components/experiment/MobileFloatingActions";

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
    } catch (error: unknown) {
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
      })) as { data: unknown };

      const blob =
        format === "json"
          ? new Blob([JSON.stringify(result.data, null, 2)], {
              type: "application/json",
            })
          : new Blob([result.data as string], { type: "text/csv" });

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

  const handleViewComparison = () => {
    document
      .getElementById("comparison-view")
      ?.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50">
      <ExperimentNavigation
        onGoHome={() => router.push("/")}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        showSidebar={showSidebar}
        onExportJSON={() => handleExport("json")}
        onExportCSV={() => handleExport("csv")}
        isExporting={exportMutation.isPending}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {showSidebar && (
            <ExperimentSidebar
              experiment={experiment}
              selectedIds={selectedIds}
              showGenerateForm={showGenerateForm}
              onSelectResponse={handleSelectResponse}
              onToggleGenerateForm={() =>
                setShowGenerateForm(!showGenerateForm)
              }
              onViewComparison={handleViewComparison}
              onClearSelection={() => setSelectedIds([])}
            />
          )}

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {showGenerateForm && (
              <GenerateResponseForm
                parameterRanges={parameterRanges}
                onParameterRangesChange={setParameterRanges}
                onGenerate={handleGenerate}
                onClose={() => setShowGenerateForm(false)}
                isGenerating={generateMutation.isPending}
                isValid={isValid}
              />
            )}

            {generateMutation.isPending && <GeneratingIndicator />}

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

            <ResponsesList
              responses={experiment.responses || []}
              selectedIds={selectedIds}
              onSelectResponse={handleSelectResponse}
              onViewComparison={handleViewComparison}
              onShowGenerateForm={() => setShowGenerateForm(true)}
            />
          </main>
        </div>
      </div>

      <MobileFloatingActions
        selectedCount={selectedIds.length}
        onViewComparison={handleViewComparison}
        onToggleGenerateForm={() => setShowGenerateForm(!showGenerateForm)}
        showGenerateForm={showGenerateForm}
      />
    </div>
  );
}
