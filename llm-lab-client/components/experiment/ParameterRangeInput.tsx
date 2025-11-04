import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ParameterRangeInputProps = {
  label: string;
  values: number[];
  onChange: (values: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
};

export const ParameterRangeInput: React.FC<ParameterRangeInputProps> = ({
  label,
  values,
  onChange,
  min = 0,
  max = 1,
  step = 0.1,
  placeholder,
}) => {
  const [inputValue, setInputValue] = useState(
    values.length > 0 ? values.join(", ") : ""
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleApply = () => {
    const parsed = inputValue
      .split(",")
      .map((v) => parseFloat(v.trim()))
      .filter((v) => !isNaN(v) && v >= min && v <= max);

    if (parsed.length > 0) {
      const unique = Array.from(new Set(parsed)).sort((a, b) => a - b);
      onChange(unique);
      setInputValue(unique.join(", "));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleApply();
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={placeholder || "e.g., 0.1, 0.5, 0.9"}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button type="button" onClick={handleApply} size="md">
          Apply
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((value, index) => (
            <span
              key={index}
              className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
            >
              {value.toFixed(2)}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const newValues = values.filter((_, i) => i !== index);
                  onChange(newValues);
                  setInputValue(newValues.join(", "));
                }}
                className="ml-1.5 inline-flex rounded-full text-indigo-600 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <span className="sr-only">Remove</span>
                <svg
                  className="h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Enter comma-separated values between {min} and {max}
      </p>
    </div>
  );
};
