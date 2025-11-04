import React from "react";
import { ParameterRangeInput } from "./ParameterRangeInput";
import { type ParameterRanges } from "@/lib/constants";

type ParameterInputsGridProps = {
  parameterRanges: ParameterRanges;
  onChange: (ranges: ParameterRanges) => void;
};

export const ParameterInputsGrid: React.FC<ParameterInputsGridProps> = ({
  parameterRanges,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <ParameterRangeInput
        label="Temperature (0.0 - 2.0)"
        values={parameterRanges.temperature}
        onChange={(values) =>
          onChange({ ...parameterRanges, temperature: values })
        }
        min={0}
        max={2}
        step={0.1}
      />
      <ParameterRangeInput
        label="Top P (0.0 - 1.0)"
        values={parameterRanges.topP}
        onChange={(values) => onChange({ ...parameterRanges, topP: values })}
        min={0}
        max={1}
        step={0.05}
      />
      <ParameterRangeInput
        label="Top K (positive integers)"
        values={parameterRanges.topK}
        onChange={(values) => onChange({ ...parameterRanges, topK: values })}
        min={1}
        max={100}
        step={1}
        placeholder="e.g., 20, 40, 60"
      />
      <ParameterRangeInput
        label="Max Output Tokens"
        values={parameterRanges.maxOutputTokens}
        onChange={(values) =>
          onChange({ ...parameterRanges, maxOutputTokens: values })
        }
        min={1}
        max={8192}
        step={256}
        placeholder="e.g., 1024, 2048, 4096"
      />
    </div>
  );
};
