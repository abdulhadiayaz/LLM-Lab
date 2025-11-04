import React from "react";
import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/lib/components/ui/card";
import { ParameterInputsGrid } from "./ParameterInputsGrid";
import { ParameterValidation } from "./ParameterValidation";
import { type ParameterRanges } from "@/lib/constants";

type GenerateResponseFormProps = {
  parameterRanges: ParameterRanges;
  onParameterRangesChange: (ranges: ParameterRanges) => void;
  onGenerate: () => void;
  onClose: () => void;
  isGenerating: boolean;
  isValid: boolean;
};

export const GenerateResponseForm: React.FC<GenerateResponseFormProps> = ({
  parameterRanges,
  onParameterRangesChange,
  onGenerate,
  onClose,
  isGenerating,
  isValid,
}) => {
  return (
    <Card className="mb-8 shadow-xl border-2 border-indigo-200 animate-in slide-in-from-top-2">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-xl">
            <span>⚙️</span>
            Generate New Responses
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-6">
          <ParameterInputsGrid
            parameterRanges={parameterRanges}
            onChange={onParameterRangesChange}
          />
        </div>
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !isValid}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Generating...
            </>
          ) : (
            <>🚀 Generate Responses</>
          )}
        </Button>

        <ParameterValidation parameterRanges={parameterRanges} />
      </CardContent>
    </Card>
  );
};
