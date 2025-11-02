import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ParameterRangeInput } from "./ParameterRangeInput";
import { useCreateExperiment } from "@/lib/hooks";
import { useRouter } from "next/router";

export const ExperimentForm: React.FC = () => {
  const router = useRouter();
  const createMutation = useCreateExperiment();

  const [prompt, setPrompt] = useState("");
  const [parameterRanges, setParameterRanges] = useState({
    temperature: [0.1, 0.5, 0.9] as number[],
    topP: [0.95] as number[],
    topK: [40] as number[],
    maxOutputTokens: [2048] as number[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      alert("Please enter a prompt");
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        prompt: prompt.trim(),
        parameterRanges,
      });

      // Navigate to experiment page
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

            <ParameterRangeInput
              label="Temperature (0.0 - 2.0)"
              values={parameterRanges.temperature}
              onChange={(values) =>
                setParameterRanges({ ...parameterRanges, temperature: values })
              }
              min={0}
              max={2}
              step={0.1}
            />

            <ParameterRangeInput
              label="Top P (0.0 - 1.0)"
              values={parameterRanges.topP}
              onChange={(values) =>
                setParameterRanges({ ...parameterRanges, topP: values })
              }
              min={0}
              max={1}
              step={0.05}
            />

            <ParameterRangeInput
              label="Top K (positive integers)"
              values={parameterRanges.topK}
              onChange={(values) =>
                setParameterRanges({ ...parameterRanges, topK: values })
              }
              min={1}
              max={100}
              step={1}
            />

            <ParameterRangeInput
              label="Max Output Tokens"
              values={parameterRanges.maxOutputTokens}
              onChange={(values) =>
                setParameterRanges({
                  ...parameterRanges,
                  maxOutputTokens: values,
                })
              }
              min={1}
              max={8192}
              step={256}
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
            disabled={createMutation.isPending || !prompt.trim()}
            className="w-full"
          >
            {createMutation.isPending ? "Creating..." : "Create Experiment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

