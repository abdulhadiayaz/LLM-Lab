import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell,
} from "recharts";
import { Response } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";

type MetricsChartProps = {
  responses: Response[];
};

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export const MetricsChart: React.FC<MetricsChartProps> = ({ responses }) => {
  if (!responses || responses.length === 0) {
    return null;
  }

  const responsesWithMetrics = responses.filter((r) => r.metrics);

  if (responsesWithMetrics.length === 0) {
    return null;
  }

  const barData = responsesWithMetrics.map((response, index) => ({
    name: `Response ${index + 1}`,
    coherence: (response.metrics?.coherenceScore || 0) * 100,
    completeness: (response.metrics?.completenessScore || 0) * 100,
    length: (response.metrics?.lengthScore || 0) * 100,
    readability: (response.metrics?.readabilityScore || 0) * 100,
    structure: (response.metrics?.structureScore || 0) * 100,
    overall: (response.metrics?.overallScore || 0) * 100,
  }));

  const scatterData = responsesWithMetrics.map((response) => ({
    temperature: response.temperature,
    overallScore: (response.metrics?.overallScore || 0) * 100,
    topP: response.topP,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Metrics Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(value) => {
                  const formatted = value.toFixed(2);
                  return formatted.replace(/\.?0+$/, "");
                }}
              />
              <Tooltip
                formatter={(value: number) => {
                  const formatted = value.toFixed(2);
                  return `${formatted.replace(/\.?0+$/, "")}%`;
                }}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar dataKey="overall" fill="#6366f1" name="Overall" />
              <Bar dataKey="coherence" fill="#10b981" name="Coherence" />
              <Bar dataKey="completeness" fill="#f59e0b" name="Completeness" />
              <Bar dataKey="length" fill="#ef4444" name="Length" />
              <Bar dataKey="readability" fill="#8b5cf6" name="Readability" />
              <Bar dataKey="structure" fill="#06b6d4" name="Structure" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Temperature vs Quality</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="temperature"
                name="Temperature"
                domain={[0, 2]}
                tickFormatter={(value) => {
                  const formatted = value.toFixed(2);
                  return formatted.replace(/\.?0+$/, "");
                }}
              />
              <YAxis
                type="number"
                dataKey="overallScore"
                name="Overall Score"
                domain={[0, 100]}
                tickFormatter={(value) => {
                  const formatted = value.toFixed(2);
                  return formatted.replace(/\.?0+$/, "");
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    const formatNumber = (num: number) => {
                      const formatted = num.toFixed(2);
                      return formatted.replace(/\.?0+$/, "");
                    };
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded shadow">
                        <p className="font-semibold">
                          Temp: {formatNumber(data.temperature)}
                        </p>
                        <p className="text-sm">
                          Score: {formatNumber(data.overallScore)}%
                        </p>
                        <p className="text-xs text-gray-500">
                          Top P: {formatNumber(data.topP)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#6366f1">
                {scatterData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
