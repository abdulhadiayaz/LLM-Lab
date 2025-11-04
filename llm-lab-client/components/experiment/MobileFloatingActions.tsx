import React from "react";
import { Button } from "@/components/ui/button";

type MobileFloatingActionsProps = {
  selectedCount: number;
  onViewComparison: () => void;
  onToggleGenerateForm: () => void;
  showGenerateForm: boolean;
};

export const MobileFloatingActions: React.FC<MobileFloatingActionsProps> = ({
  selectedCount,
  onViewComparison,
  onToggleGenerateForm,
  showGenerateForm,
}) => {
  return (
    <div className="lg:hidden fixed bottom-6 right-6 z-50">
      <div className="flex flex-col gap-3">
        {selectedCount > 0 && (
          <Button
            onClick={onViewComparison}
            className="rounded-full shadow-2xl h-14 w-14 p-0"
            size="lg"
          >
            🔍
          </Button>
        )}
        <Button
          onClick={onToggleGenerateForm}
          className="rounded-full shadow-2xl h-14 w-14 p-0 text-2xl"
          size="lg"
        >
          {showGenerateForm ? "✕" : "➕"}
        </Button>
      </div>
    </div>
  );
};

