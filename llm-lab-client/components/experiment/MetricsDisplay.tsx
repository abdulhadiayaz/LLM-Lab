import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsDisplayProps {
  metrics: {
    coherenceScore: number;
    completenessScore: number;
    lengthScore: number;
    readabilityScore: number;
    structureScore: number;
    overallScore: number;
  };
  compact?: boolean;
}

const ScoreBar: React.FC<{
  label: string;
  value: number;
  color?: string;
}> = ({ label, value, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-600">{(value * 100).toFixed(1)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo} h-2 rounded-full transition-all duration-300`}
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
};

export const MetricsDisplay: React.FC<MetricsDisplayProps> = ({
  metrics,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center">
          <div className="text-xs text-gray-500">Overall</div>
          <div className="text-lg font-bold text-indigo-600">
            {(metrics.overallScore * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Coherence</div>
          <div className="text-sm font-semibold">
            {(metrics.coherenceScore * 100).toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500">Complete</div>
          <div className="text-sm font-semibold">
            {(metrics.completenessScore * 100).toFixed(1)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quality Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-indigo-50 rounded-lg">
          <div className="text-center">
            <div className="text-xs text-gray-600 mb-1">Overall Score</div>
            <div className="text-3xl font-bold text-indigo-600">
              {(metrics.overallScore * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ScoreBar label="Coherence" value={metrics.coherenceScore} />
          <ScoreBar label="Completeness" value={metrics.completenessScore} />
          <ScoreBar label="Length Appropriateness" value={metrics.lengthScore} />
          <ScoreBar label="Readability" value={metrics.readabilityScore} />
          <ScoreBar label="Structure" value={metrics.structureScore} />
        </div>
      </CardContent>
    </Card>
  );
};

