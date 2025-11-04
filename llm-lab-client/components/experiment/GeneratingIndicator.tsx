import React from "react";
import { Card, CardContent } from "@/components/ui/card";

export const GeneratingIndicator: React.FC = () => {
  return (
    <Card className="mb-8 border-2 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-lg animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-amber-200 border-t-amber-600"></div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              Generating responses...
            </p>
            <p className="text-sm text-gray-600 mt-1">
              This may take a while. Please don&apos;t close this page.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

