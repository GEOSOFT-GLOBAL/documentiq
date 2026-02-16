# Zustand Store Integration Pattern

This directory contains Zustand stores that manage state and API communication with the backend service.

## Overview

All AI-powered features in DocumentIQ now use Zustand stores to communicate with the backend API instead of making direct calls to AI providers from the frontend. This provides:

- **Security**: API keys are stored securely on the backend
- **Centralized State Management**: Consistent loading, error, and data states
- **Type Safety**: Full TypeScript support with interfaces
- **Maintainability**: Easy to update and test
- **Scalability**: Better rate limiting and caching opportunities

## Existing Stores

### `authStore.ts`
Manages user authentication state and operations.

### `equationStore.ts`
Handles equation parsing, conversion, solving, and validation operations.

### `summarizerStore.ts`
Manages text summarization with customizable length, format, and detail level.

### `citationStore.ts`
Handles citation generation from various sources and format conversion.

## Integration Pattern

When integrating a new backend API endpoint, follow this pattern:

### 1. Create Store File

```typescript
// src/store/yourFeatureStore.ts
import { create } from "zustand";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// Define request/response interfaces
interface YourFeatureRequest {
  inputData: string;
  options?: {
    setting1?: string;
    setting2?: number;
  };
}

interface YourFeatureResult {
  outputData: string;
  metadata?: {
    processingTime?: number;
  };
}

// Define store state interface
interface YourFeatureState {
  isLoading: boolean;
  error: string | null;

  // Define your API methods
  processFeature: (request: YourFeatureRequest) => Promise<YourFeatureResult>;

  // Clear error helper
  clearError: () => void;
}

// Create the store
export const useYourFeatureStore = create<YourFeatureState>((set) => ({
  isLoading: false,
  error: null,

  processFeature: async (request: YourFeatureRequest) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`${API_BASE}/docxiq/your-endpoint`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to process feature");
      }

      set({ isLoading: false });
      return json.data;
    } catch (err) {
      const error =
        err instanceof Error ? err.message : "Failed to process feature";
      set({ error, isLoading: false });
      throw err;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
```

### 2. Use Store in Component

```typescript
// src/views/your-feature.tsx
import { useState } from "react";
import { useYourFeatureStore } from "@/store/yourFeatureStore";
import { toast } from "sonner";

const YourFeature = () => {
  const { processFeature, isLoading, error, clearError } = useYourFeatureStore();
  
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleProcess = async () => {
    if (!input.trim()) {
      toast.error("Please enter some input");
      return;
    }

    try {
      const result = await processFeature({
        inputData: input,
        options: {
          setting1: "value1",
          setting2: 50,
        },
      });

      setOutput(result.outputData);
      toast.success("Processing complete!");
    } catch (err) {
      toast.error(
        `Processing failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    clearError();
  };

  return (
    <div>
      <Button onClick={handleProcess} disabled={isLoading}>
        {isLoading ? "Processing..." : "Process"}
      </Button>
      {error && <div className="error">{error}</div>}
      {/* Rest of your UI */}
    </div>
  );
};
```

## Key Principles

### 1. **Consistent Error Handling**
- Always set `isLoading: true` before async operations
- Set `isLoading: false` after completion
- Capture errors and store them in the `error` state
- Throw errors so components can also handle them

### 2. **Type Safety**
- Define clear interfaces for requests and responses
- Use TypeScript types throughout
- Export interfaces for use in components

### 3. **API Base URL**
- Always use `API_BASE` from environment variables
- Default to `http://localhost:5000/api/v1` for development
- Use `/docxiq/` prefix for DocumentIQ endpoints

### 4. **State Management**
- Keep store minimal - only loading, error, and API methods
- Component-specific UI state stays in the component
- Use `clearError()` helper for resetting error state

### 5. **Response Format**
- Backend always returns: `{ status, success, message, data }`
- Check both `res.ok` and `json.success`
- Return `json.data` from the store method

## Backend Endpoint Requirements

For the store to work properly, your backend endpoint should:

```typescript
// Backend controller example
public static async yourFeatureMethod(req: Request, res: Response, next: NextFunction) {
  try {
    const { inputData, options } = req.body;

    // Validate input
    if (!inputData) {
      throw new APIError({
        status: 400,
        message: "inputData is required",
        isPublic: true,
      });
    }

    // Process the request
    const result = await processYourFeature(inputData, options);

    // Return standardized response
    return res.status(200).json(
      createResponse({
        status: 200,
        success: true,
        message: "Feature processed successfully",
        data: {
          outputData: result,
          metadata: { processingTime: 123 },
        },
      })
    );
  } catch (error) {
    next(error);
  }
}
```

## Testing Your Integration

1. **Start the backend service**:
   ```bash
   cd service
   pnpm dev
   ```

2. **Start the frontend**:
   ```bash
   cd documentiq
   pnpm dev
   ```

3. **Test the feature** through the UI

4. **Check for errors** in both browser console and backend logs

## Common Issues

### Issue: CORS Error
**Solution**: Ensure backend CORS is configured for your frontend URL

### Issue: 404 Not Found
**Solution**: Check that the endpoint path matches the backend route

### Issue: 400 Bad Request
**Solution**: Verify request body matches backend expectations

### Issue: Type Errors
**Solution**: Ensure interfaces match backend response structure

## Migration from useGemini

If you're migrating an existing feature from `useGemini`:

**Before**:
```typescript
const { generateContent, loading, error } = useGemini();

const result = await generateContent({
  prompt: "Your prompt here",
  type: PromptType.FEATURE,
});
```

**After**:
```typescript
const { yourMethod, isLoading, error } = useYourFeatureStore();

const result = await yourMethod({
  inputData: "Your data here",
  options: { /* your options */ },
});
```

## References

- Backend Service: `geo-soft/service/`
- Backend Controllers: `service/src/controllers/docxiq/`
- Backend Routes: `service/src/routes/docxiq/`

## Contributing

When adding a new store:
1. Follow the pattern shown above
2. Add comprehensive TypeScript types
3. Include error handling
4. Update this README with your store
5. Test thoroughly with the backend