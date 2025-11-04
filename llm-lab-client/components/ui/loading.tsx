import React from "react";

type LoadingSpinnerProps = {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4">
        <div
          className={`animate-spin rounded-full border-indigo-200 border-t-indigo-600 ${sizeClasses[size]}`}
        />
        {text && <p className="text-lg text-gray-600 font-medium">{text}</p>}
      </div>
    </div>
  );
};
