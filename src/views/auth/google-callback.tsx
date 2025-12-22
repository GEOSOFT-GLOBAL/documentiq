/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_URL } from "@/constants";

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const code = searchParams.get("code");

    if (!code) {
      setError("No authorization code received");
      return;
    }

    const handleCallback = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/v1/auth/google-signin/callback?code=${code}`
        );
        const data = await response.json();

        if (data.success) {
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);
          localStorage.setItem("user", JSON.stringify(data.data.user));
          navigate("/app");
        } else {
          setError(data.message || "Authentication failed");
        }
      } catch (err) {
        setError("Failed to complete authentication");
        console.error(err);
      }
    };

    handleCallback();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <a href="/auth/signin" className="text-primary hover:underline">
            Back to Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Completing sign in...</p>
    </div>
  );
};

export default GoogleCallback;
