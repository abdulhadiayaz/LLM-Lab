import React from "react";
import { Button } from "@/components/ui/button";

type ExperimentNavigationProps = {
  onGoHome: () => void;
  onToggleSidebar: () => void;
  showSidebar: boolean;
  onExportJSON: () => void;
  onExportCSV: () => void;
  isExporting: boolean;
};

export const ExperimentNavigation: React.FC<ExperimentNavigationProps> = ({
  onGoHome,
  onToggleSidebar,
  showSidebar,
  onExportJSON,
  onExportCSV,
  isExporting,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Button
            variant="ghost"
            onClick={onGoHome}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Start New Experiment
          </Button>
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              title={showSidebar ? "Hide sidebar" : "Show sidebar"}
            >
              ☰
            </button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onExportJSON}
                disabled={isExporting}
                className="hidden sm:flex"
              >
                Export JSON
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onExportCSV}
                disabled={isExporting}
                className="hidden sm:flex"
              >
                Export CSV
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
