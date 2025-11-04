import React from "react";
import { Card, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { ResponseCard } from "./ResponseCard";
import { type Response } from "@/lib/api";

type ResponsesListProps = {
  responses: Response[];
  selectedIds: string[];
  onSelectResponse: (id: string) => void;
  onViewComparison: () => void;
  onShowGenerateForm: () => void;
};

export const ResponsesList: React.FC<ResponsesListProps> = ({
  responses,
  selectedIds,
  onSelectResponse,
  onViewComparison,
  onShowGenerateForm,
}) => {
  const responseCount = responses.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Responses</h2>
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
            <Button variant="outline" size="sm" onClick={onViewComparison}>
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
              Configure your parameter ranges and generate responses to start
              analyzing and comparing different LLM outputs.
            </p>
            <Button onClick={onShowGenerateForm} size="lg" className="px-8">
              ➕ Generate Your First Responses
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {responses.map((response) => (
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
                onSelect={onSelectResponse}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
