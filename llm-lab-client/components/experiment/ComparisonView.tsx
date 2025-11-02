import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Response } from "@/lib/api";
import { MetricsDisplay } from "./MetricsDisplay";

interface ComparisonViewProps {
  responses: Response[];
  selectedIds: string[];
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  responses,
  selectedIds,
}) => {
  const selectedResponses = responses.filter((r) =>
    selectedIds.includes(r.id),
  );

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
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Comparing {selectedResponses.length} Response
            {selectedResponses.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedResponses.map((response) => (
              <div key={response.id} className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-2">Parameters</div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">Temp:</span>{" "}
                      {response.temperature.toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Top P:</span>{" "}
                      {response.topP.toFixed(2)}
                    </div>
                    {response.topK && (
                      <div>
                        <span className="font-medium">Top K:</span>{" "}
                        {response.topK}
                      </div>
                    )}
                    {response.maxTokens && (
                      <div>
                        <span className="font-medium">Max Tokens:</span>{" "}
                        {response.maxTokens}
                      </div>
                    )}
                  </div>
                </div>

                {response.metrics && (
                  <MetricsDisplay metrics={response.metrics} compact />
                )}

                <div>
                  <div className="text-xs font-medium text-gray-700 mb-2">
                    Response
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 max-h-40 overflow-y-auto">
                    <p className="text-xs text-gray-800 whitespace-pre-wrap">
                      {response.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

