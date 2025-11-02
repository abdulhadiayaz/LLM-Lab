import React from "react";
import { useRouter } from "next/router";
import { ExperimentForm } from "@/components/experiment/ExperimentForm";
import { useExperimentsList } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Experiment } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const { data: experimentsData, isLoading } = useExperimentsList(5, 0);

  console.log(experimentsData);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">LLM Lab</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experiment with LLM parameters and analyze response quality. Compare
            different parameter combinations to find the best settings.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Experiment Form - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <ExperimentForm />
          </div>

          {/* Recent Experiments - Takes 1 column */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Recent Experiments</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                  </div>
                ) : experimentsData?.experiments &&
                  experimentsData.experiments.length > 0 ? (
                  <div className="space-y-3">
                    {experimentsData.experiments.map(
                      (experiment: Experiment) => (
                        <Link
                          key={experiment.id}
                          href={`/experiment/${experiment.id}`}
                        >
                          <Card className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm font-medium text-gray-900 line-clamp-2 flex-1">
                                  {experiment.prompt.substring(0, 100)}
                                  {experiment.prompt.length > 100 ? "..." : ""}
                                </p>
                              </div>
                              <div className="flex justify-between items-center text-xs text-gray-500">
                                <span>
                                  {experiment.responseCount || 0} response
                                  {(experiment.responseCount || 0) !== 1
                                    ? "s"
                                    : ""}
                                </span>
                                <span>
                                  {formatDistanceToNow(
                                    new Date(experiment.createdAt),
                                    { addSuffix: true }
                                  )}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No experiments yet. Create your first one!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-4">🧪</div>
              <h3 className="text-lg font-semibold mb-2">
                Parameter Experimentation
              </h3>
              <p className="text-sm text-gray-600">
                Test different combinations of temperature, top_p, top_k, and
                max_tokens to see how they affect responses.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">Quality Metrics</h3>
              <p className="text-sm text-gray-600">
                Automatically calculate coherence, completeness, readability,
                and structure scores for each response.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Compare & Analyze</h3>
              <p className="text-sm text-gray-600">
                Side-by-side comparison of responses and export your experiments
                for later analysis.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
