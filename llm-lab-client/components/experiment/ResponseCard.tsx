import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { MetricsDisplay } from "./MetricsDisplay";
import { Response } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface ResponseCardProps {
  response: Response;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  isSelected = false,
  onSelect,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-indigo-500 border-indigo-500"
          : "hover:shadow-md"
      }`}
      onClick={() => onSelect?.(response.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Parameters
            </h3>
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
          <MetricsDisplay metrics={response.metrics} compact />
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

