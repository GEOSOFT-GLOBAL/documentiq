import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import * as React from "react";

interface ErrorViewProps {
  propName?: string;
}

const ErrorView: React.FC<ErrorViewProps> = () => {
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-slate-300">
      <div className="rounded-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Something went wrong, The App Broke, Check Debug info for possible
            reasons, which might be: wrong navigation, unhandled exception,
            invalid data response.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default ErrorView;
