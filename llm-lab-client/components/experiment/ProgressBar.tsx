import React from "react";

type ProgressBarProps = {
  label: string;
  value: number;
  max?: number;
  color?: "indigo" | "green" | "purple" | "blue";
  showValue?: boolean;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  max = 1,
  color = "indigo",
  showValue = true,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const colorClasses = {
    indigo: "bg-indigo-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    blue: "bg-blue-600",
  };

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        {showValue && (
          <span>{typeof value === "number" ? value.toFixed(2) : value}</span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`${colorClasses[color]} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
