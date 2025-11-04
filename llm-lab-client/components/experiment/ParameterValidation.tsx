import React from "react";
import { type ParameterRanges } from "@/lib/constants";

type ParameterValidationProps = {
  parameterRanges: ParameterRanges;
};

export const ParameterValidation: React.FC<ParameterValidationProps> = ({
  parameterRanges,
}) => {
  const hasAllParameters =
    parameterRanges.temperature.length > 0 &&
    parameterRanges.topP.length > 0 &&
    parameterRanges.topK.length > 0 &&
    parameterRanges.maxOutputTokens.length > 0;

  if (hasAllParameters) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-800">
      <p className="font-semibold mb-1">Missing required parameters:</p>
      <ul className="list-disc list-inside space-y-1">
        {!parameterRanges.temperature.length && (
          <li>Temperature is required</li>
        )}
        {!parameterRanges.topP.length && <li>Top P is required</li>}
        {!parameterRanges.topK.length && <li>Top K is required</li>}
        {!parameterRanges.maxOutputTokens.length && (
          <li>Max Output Tokens is required</li>
        )}
      </ul>
    </div>
  );
};
