import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleGoogleCallback, isLoading, error, clearError } = useAuthStore();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const processedRef = useRef(false);

  useEffect(() => {
    const processGoogleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const state = searchParams.get("state");

        if (error) {
          throw new Error(`Google OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error("No authorization code received from Google");
        }

        // Prevent double execution in React Strict Mode
        if (processedRef.current) return;
        processedRef.current = true;

        // Use the auth store to handle the callback with state validation
        await handleGoogleCallback(code, state || undefined);

        setStatus("success");

        // Redirect to app after 2 seconds
        setTimeout(() => {
          navigate("/app");
        }, 2000);
      } catch (error: any) {
        console.error("Google callback error:", error);
        setStatus("error");
        setErrorMessage(error.message || "An unexpected error occurred during authentication");

        // Redirect to login after 5 seconds on error
        setTimeout(() => {
          navigate("/auth/login");
        }, 5000);
      }
    };

    processGoogleCallback();
  }, [searchParams, navigate, handleGoogleCallback]);

  // Clear any previous errors when component mounts
  useEffect(() => {
    clearError();
  }, [clearError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 border rounded-lg bg-card">
        <h1 className="text-2xl font-bold mb-2">Google Authentication</h1>
        <p className="text-muted-foreground mb-6">
          Processing your Google authentication...
        </p>

        <div className="space-y-6">
          {status === "loading" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-muted-foreground">Authenticating with Google...</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium">Authentication Successful!</p>
              <p className="text-muted-foreground text-center">
                You have been successfully authenticated with Google. Redirecting to app...
              </p>
              <button
                onClick={() => navigate("/app")}
                className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go to App
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                <svg
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-red-600">Authentication Failed</p>
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md w-full">
                {errorMessage}
              </div>
              <p className="text-muted-foreground text-center">
                You will be redirected to the login page shortly.
              </p>
              <button
                onClick={() => navigate("/auth/login")}
                className="w-full py-2 px-4 border rounded-md hover:bg-muted"
              >
                Go to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleCallback;