import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressBar } from "./ProgressBar";
import { type Response, type ExperimentWithResponses } from "@/lib/api";

type ExperimentSidebarProps = {
  experiment: ExperimentWithResponses;
  selectedIds: string[];
  showGenerateForm: boolean;
  onSelectResponse: (id: string) => void;
  onToggleGenerateForm: () => void;
  onViewComparison: () => void;
  onClearSelection: () => void;
};

export const ExperimentSidebar: React.FC<ExperimentSidebarProps> = ({
  experiment,
  selectedIds,
  showGenerateForm,
  onSelectResponse,
  onToggleGenerateForm,
  onViewComparison,
  onClearSelection,
}) => {
  const responseCount = experiment.responses?.length || 0;

  return (
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

              {/* All Responses List */}
              {responseCount > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 block">
                    All Responses ({responseCount})
                  </label>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {experiment.responses!.map(
                      (response: Response, index: number) => (
                        <button
                          key={response.id}
                          onClick={() => onSelectResponse(response.id)}
                          className={`w-full text-left p-3 rounded-lg border transition-all ${
                            selectedIds.includes(response.id)
                              ? "bg-indigo-50 border-indigo-300 shadow-sm"
                              : "bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate">
                                Response #{index + 1}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                T: {response.temperature.toFixed(2)} | P:{" "}
                                {response.topP.toFixed(2)}
                              </div>
                            </div>
                            {response.metrics && (
                              <div className="ml-2 flex-shrink-0">
                                <div
                                  className={`text-xs font-bold px-2 py-1 rounded ${
                                    response.metrics.overallScore > 0.7
                                      ? "bg-green-100 text-green-700"
                                      : response.metrics.overallScore > 0.5
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {(
                                    response.metrics.overallScore * 100
                                  ).toFixed(0)}
                                  %
                                </div>
                              </div>
                            )}
                          </div>
                          {selectedIds.includes(response.id) && (
                            <div className="mt-2 text-xs text-indigo-600 font-medium">
                              ✓ Selected
                            </div>
                          )}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Button
                  onClick={onToggleGenerateForm}
                  className="w-full"
                  variant={showGenerateForm ? "default" : "outline"}
                  size="sm"
                >
                  {showGenerateForm
                    ? "✕ Hide Generator"
                    : "➕ Generate More Responses"}
                </Button>
                {selectedIds.length > 0 && (
                  <>
                    <Button
                      onClick={onViewComparison}
                      className="w-full"
                      size="sm"
                    >
                      🔍 Compare ({selectedIds.length})
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={onClearSelection}
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

        {/* Quick Metrics - Individual Response Quality */}
        {responseCount > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Response Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {experiment.responses!.map(
                  (response: Response, index: number) => (
                    <div key={response.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-medium text-gray-700">
                          Response #{index + 1}
                        </span>
                        {response.metrics && (
                          <span className="font-bold text-gray-900">
                            {(response.metrics.overallScore * 100).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      {response.metrics ? (
                        <ProgressBar
                          label=""
                          value={response.metrics.overallScore}
                          max={1}
                          color={
                            response.metrics.overallScore > 0.7
                              ? "green"
                              : response.metrics.overallScore > 0.5
                              ? "indigo"
                              : "purple"
                          }
                          showValue={false}
                        />
                      ) : (
                        <div className="text-xs text-gray-400 italic">
                          No metrics available
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </aside>
  );
};
