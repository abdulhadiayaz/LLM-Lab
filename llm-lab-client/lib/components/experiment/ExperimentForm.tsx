import React, { useState } from "react";
import { Textarea } from "@/lib/components/ui/textarea";
import { Button } from "@/lib/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/lib/components/ui/card";
import { ParameterInputsGrid } from "./ParameterInputsGrid";
import { ParameterValidation } from "./ParameterValidation";
import {
  useCreateExperiment,
  useGenerateResponses,
  useParameterValidation,
} from "@/lib/hooks";
import { useRouter } from "next/router";
import { DEFAULT_PARAMETER_RANGES } from "@/lib/constants";

export const ExperimentForm: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreateExperiment();
  const generateMutation = useGenerateResponses();

  const [prompt, setPrompt] = useState("");
  const [parameterRanges, setParameterRanges] = useState(
    DEFAULT_PARAMETER_RANGES
  );

  const { isValid, missingParams } = useParameterValidation(parameterRanges);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    if (!isValid) {
      alert(
        `The following parameter ranges are required but missing:\n${missingParams.join(
          ", "
        )}\n\nPlease provide values for all parameters.`
      );
      return;
    }

    try {
      const result = (await createMutation.mutateAsync({
        prompt: prompt.trim(),
        parameterRanges,
      })) as { id: string };

      try {
        await generateMutation.mutateAsync({
          experimentId: result.id,
          parameterRanges,
        });
      } catch (generateError) {
        console.error("Failed to generate responses:", generateError);
        alert(
          "Experiment created but response generation failed. You can try generating responses on the experiment page."
        );
      }

      router.push(`/experiment/${result.id}`);
    } catch (error) {
      console.error("Failed to create experiment:", error);
      alert("Failed to create experiment. Please try again.");
    }
  };

  const totalCombinations =
    (parameterRanges.temperature.length || 1) *
    (parameterRanges.topP.length || 1) *
    (parameterRanges.topK.length || 1) *
    (parameterRanges.maxOutputTokens.length || 1);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Experiment</CardTitle>
        <CardDescription>
          Enter a prompt and configure parameter ranges to generate multiple LLM
          responses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="prompt"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Prompt
            </label>
            <Textarea
              id="prompt"
              rows={6}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  return;
                }
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
              placeholder="Enter your prompt here..."
              className="w-full"
              required
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Parameter Ranges
            </h3>
            <p className="text-sm text-gray-600">
              Configure ranges for each parameter. All combinations will be
              generated.
            </p>

            <ParameterInputsGrid
              parameterRanges={parameterRanges}
              onChange={setParameterRanges}
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Total combinations:</span>{" "}
              {totalCombinations}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This will generate {totalCombinations} responses with different
              parameter combinations
            </p>
          </div>

          <Button
            type="submit"
            disabled={
              createMutation.isPending ||
              generateMutation.isPending ||
              !prompt.trim() ||
              !isValid
            }
            className="w-full"
            size="lg"
          >
            {createMutation.isPending || generateMutation.isPending ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating & Generating...
              </>
            ) : (
              <>🚀 Create Experiment & Generate Responses</>
            )}
          </Button>

          <ParameterValidation parameterRanges={parameterRanges} />
        </form>
      </CardContent>
    </Card>
  );
};
