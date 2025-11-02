import React, { useState } from "react";
import { useRouter } from "next/router";
import {
  useExperiment,
  useGenerateResponses,
  useExportExperiment,
} from "@/lib/hooks";
import { ResponseCard } from "@/components/experiment/ResponseCard";
import { ComparisonView } from "@/components/experiment/ComparisonView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParameterRangeInput } from "@/components/experiment/ParameterRangeInput";
import { MetricsChart } from "@/components/experiment/MetricsChart";
import { Response } from "@/lib/api";

export default function ExperimentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const experimentId = id as string;

  const { data: experiment, isLoading, error } = useExperiment(experimentId);
  const generateMutation = useGenerateResponses();
  const exportMutation = useExportExperiment();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [parameterRanges, setParameterRanges] = useState({
    temperature: [0.1, 0.5, 0.9] as number[],
    topP: [0.95] as number[],
    topK: [40] as number[],
    maxOutputTokens: [2048] as number[],
  });

  const handleSelectResponse = (responseId: string) => {
    setSelectedIds((prev) =>
      prev.includes(responseId)
        ? prev.filter((id) => id !== responseId)
        : [...prev, responseId]
    );
  };

  const handleGenerate = async () => {
    if (!experimentId) return;

    try {
      await generateMutation.mutateAsync({
        experimentId,
        parameterRanges,
      });
      setShowGenerateForm(false);
      // Responses will auto-refresh via React Query
    } catch (error) {
      console.error("Failed to generate responses:", error);
      alert("Failed to generate responses. Please try again.");
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    if (!experimentId) return;

    try {
      const result = await exportMutation.mutateAsync({
        experimentId,
        format,
      });

      // Download file
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading experiment...</p>
        </div>
      </div>
    );
  }

  if (error || !experiment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 mb-4">
              Failed to load experiment. Please try again.
            </p>
            <Button onClick={() => router.push("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4"
          >
            ← Back to Home
          </Button>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Experiment</CardTitle>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {experiment.prompt}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    onClick={() => handleExport("json")}
                    disabled={exportMutation.isPending}
                  >
                    Export JSON
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleExport("csv")}
                    disabled={exportMutation.isPending}
                  >
                    Export CSV
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div className="mb-6 flex gap-4">
          <Button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            variant={showGenerateForm ? "default" : "outline"}
          >
            {showGenerateForm ? "Hide" : "Generate More Responses"}
          </Button>
          <Button
            onClick={() => setShowComparison(!showComparison)}
            variant={showComparison ? "default" : "outline"}
            disabled={selectedIds.length === 0}
          >
            {showComparison ? "Hide Comparison" : "Compare Selected"}
            {selectedIds.length > 0 && ` (${selectedIds.length})`}
          </Button>
          {selectedIds.length > 0 && (
            <Button variant="ghost" onClick={() => setSelectedIds([])}>
              Clear Selection
            </Button>
          )}
        </div>

        {showGenerateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate Responses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ParameterRangeInput
                label="Temperature (0.0 - 2.0)"
                values={parameterRanges.temperature}
                onChange={(values) =>
                  setParameterRanges({
                    ...parameterRanges,
                    temperature: values,
                  })
                }
                min={0}
                max={2}
                step={0.1}
              />
              <ParameterRangeInput
                label="Top P (0.0 - 1.0)"
                values={parameterRanges.topP}
                onChange={(values) =>
                  setParameterRanges({ ...parameterRanges, topP: values })
                }
                min={0}
                max={1}
                step={0.05}
              />
              <ParameterRangeInput
                label="Top K (positive integers)"
                values={parameterRanges.topK}
                onChange={(values) =>
                  setParameterRanges({ ...parameterRanges, topK: values })
                }
                min={1}
                max={100}
                step={1}
              />
              <ParameterRangeInput
                label="Max Output Tokens"
                values={parameterRanges.maxOutputTokens}
                onChange={(values) =>
                  setParameterRanges({
                    ...parameterRanges,
                    maxOutputTokens: values,
                  })
                }
                min={1}
                max={8192}
                step={256}
              />
              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="w-full"
              >
                {generateMutation.isPending
                  ? "Generating..."
                  : "Generate Responses"}
              </Button>
            </CardContent>
          </Card>
        )}

        {showComparison && (
          <div className="mb-6">
            <ComparisonView
              responses={experiment.responses}
              selectedIds={selectedIds}
            />
          </div>
        )}

        {generateMutation.isPending && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">
                Generating responses... This may take a while.
              </p>
            </CardContent>
          </Card>
        )}

        {experiment.responses?.length > 0 && (
          <div className="mb-6">
            <MetricsChart responses={experiment.responses} />
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Responses ({experiment.responses?.length})
          </h2>
        </div>

        {experiment.responses?.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-gray-500">
              No responses yet. Click "Generate More Responses" to start.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiment.responses?.map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                isSelected={selectedIds.includes(response.id)}
                onSelect={handleSelectResponse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
