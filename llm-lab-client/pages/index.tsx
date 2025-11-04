import React from "react";
import Image from "next/image";
import Head from "next/head";
import type { GetServerSideProps } from "next";
import { ExperimentForm } from "@/lib/components/experiment/ExperimentForm";
import { useExperimentsList } from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { LoadingSpinner } from "@/lib/components/ui/loading";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Experiment } from "@/lib/api";
import { getServerSideExperiments } from "@/lib/getServerSideProps";

export default function Home() {
  const { data: experimentsData, isLoading } = useExperimentsList(5, 0);

  return (
    <>
      <Head>
        <title>LLM Lab - Experiment with AI Parameters</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="relative w-12 h-12 md:w-12 md:h-12">
                <Image
                  src="/assets/images/model.png"
                  alt="LLM Lab Logo"
                  width={60}
                  height={60}
                  className="object-contain"
                  style={{
                    animation: "spin-smooth 5s ease-in-out infinite",
                  }}
                />
              </div>
              <h1 className="text-5xl font-bold text-gray-900">LLM Lab</h1>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experiment with LLM parameters and analyze response quality.
              Compare different parameter combinations to find the best
              settings.
            </p>
          </div>

          {/* Features Section */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 inline-block">
                  🧪
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-indigo-700 transition-colors duration-300">
                  Parameter Experimentation
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                  Test different combinations of temperature, top_p, top_k, and
                  max_tokens to see how they affect responses.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:shadow-green-100/50 ">
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 inline-block">
                  📊
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-green-700 transition-colors duration-300">
                  Quality Metrics
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                  Automatically calculate coherence, completeness, readability,
                  and structure scores for each response.
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-100/50">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <CardContent className="p-6 relative z-10">
                <div className="text-4xl mb-4 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 inline-block">
                  🔍
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                  Compare & Analyze
                </h3>
                <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors duration-300 leading-relaxed">
                  Side-by-side comparison of responses and export your
                  experiments for later analysis.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-16">
            <div className="lg:col-span-2">
              <ExperimentForm />
            </div>

            <div className="lg:col-span-1">
              <Card className="shadow-lg border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <span>📋</span>
                    <span>Recent Experiments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {isLoading ? (
                    <div className="py-8">
                      <LoadingSpinner size="sm" className="py-4" />
                    </div>
                  ) : experimentsData?.experiments &&
                    experimentsData.experiments.length > 0 ? (
                    <div className="space-y-4">
                      {experimentsData.experiments.map(
                        (experiment: Experiment) => (
                          <Link
                            key={experiment.id}
                            href={`/experiment/${experiment.id}`}
                            className="block group"
                          >
                            <div className="bg-gradient-to-br from-white to-gray-50 rounded-lg border-2 border-gray-200 hover:border-indigo-300 transition-all duration-200 hover:shadow-lg p-4 group-hover:scale-[1.02]">
                              <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-lg">🧪</span>
                                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                                      {experiment.prompt.substring(0, 60)}
                                      {experiment.prompt.length > 60
                                        ? "..."
                                        : ""}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                                    {experiment.prompt.length > 60
                                      ? experiment.prompt.substring(60, 150)
                                      : ""}
                                    {experiment.prompt.length > 150
                                      ? "..."
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs">📊</span>
                                    <span className="text-xs font-semibold text-indigo-600">
                                      {experiment.responseCount || 0}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {(experiment.responseCount || 0) === 1
                                        ? "response"
                                        : "responses"}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <span className="text-[10px]">⏱</span>
                                  <span>
                                    {formatDistanceToNow(
                                      new Date(experiment.createdAt),
                                      { addSuffix: true }
                                    )}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <div className="flex items-center text-xs text-indigo-600 font-medium group-hover:text-indigo-700 transition-colors">
                                  <span>View Experiment</span>
                                  <span className="ml-1 group-hover:translate-x-1 transition-transform">
                                    →
                                  </span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-5xl mb-4">🔬</div>
                      <p className="text-sm text-gray-500 font-medium mb-2">
                        No experiments yet
                      </p>
                      <p className="text-xs text-gray-400">
                        Create your first experiment to get started!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const props = await getServerSideExperiments(5, 0);
  return {
    props,
  };
};
