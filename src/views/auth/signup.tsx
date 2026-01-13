import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Signup = () => {
  const navigate = useNavigate();
  const {
    signup,
    initiateGoogleAuth,
    isLoading,
    error,
    clearError,
    accountLinkPrompt,
    clearAccountLinkPrompt,
  } = useAuthStore();

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setValidationError("");

    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    try {
      await signup({ email, password, username, firstname, lastname });
      navigate("/app");
    } catch {
      // Error handled by store
    }
  };

  const handleLinkAccount = async () => {
    try {
      await signup({
        email,
        password,
        username,
        firstname,
        lastname,
        linkAccount: true,
      });
      navigate("/app");
    } catch {
      // Error handled by store
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await initiateGoogleAuth();
    } catch {
      // Error handled by store
    }
  };

  const displayError = validationError || error;

  // Account linking prompt
  if (accountLinkPrompt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-md p-8 border rounded-lg bg-card">
          <h1 className="text-2xl font-bold mb-2">Account Found</h1>
          <p className="text-muted-foreground mb-6">
            An account with this email already exists
          </p>

          <div className="space-y-4">
            <p className="text-sm">{accountLinkPrompt.prompt}</p>

            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-2">Existing apps:</p>
              <div className="flex gap-2 flex-wrap">
                {accountLinkPrompt.existingApps.map((app) => (
                  <span
                    key={app}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded capitalize"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>

            {displayError && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
                {displayError}
              </div>
            )}

            <button
              onClick={handleLinkAccount}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {isLoading ? "Linking..." : "Link Accounts"}
            </button>

            <button
              onClick={() => {
                clearAccountLinkPrompt();
                clearError();
              }}
              disabled={isLoading}
              className="w-full py-2 px-4 border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Use Different Email
            </button>

            <p className="text-xs text-muted-foreground text-center">
              Linking accounts means you&apos;ll use the same password across
              all apps.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 border rounded-lg bg-card">
        <h1 className="text-2xl font-bold mb-2">Create an account</h1>
        <p className="text-muted-foreground mb-6">
          Get started with DocXIQ
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {displayError && (
            <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-950 rounded-md">
              {displayError}
              <button
                type="button"
                onClick={() => {
                  setValidationError("");
                  clearError();
                }}
                className="ml-2 underline"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="John"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="w-full px-3 py-2 border rounded-md bg-background"
                placeholder="Doe"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="johndoe"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              At least 8 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md bg-background"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className="w-full py-2 px-4 border rounded-md hover:bg-muted disabled:opacity-50"
          >
            Continue with Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="#/auth/login" className="text-primary hover:underline">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

export default Signup;
