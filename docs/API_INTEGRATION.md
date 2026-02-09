# API Integration Documentation

## Overview

This document describes the integration between the DocumentIQ frontend and the backend service API. The integration replaces direct client-side AI API calls with server-side endpoints for improved security, centralized management, and better rate limiting.

## Architecture

### Before
- Frontend directly called Google Gemini API using `useGemini` hook
- API keys exposed in client-side environment variables
- Each feature made direct API calls

### After
- Frontend calls backend service API endpoints
- Backend service manages AI provider integration
- API keys secured on server-side
- Centralized error handling and rate limiting

## Service Structure

### Backend API Endpoints

**Base URL:** `http://localhost:5000/api/v1` (development)

#### Summarization Endpoint

```
POST /docxiq/research/summarize
```

**Request Body:**
```typescript
{
  text: string;                              // Required: Text to summarize
  summaryLength?: "short" | "medium" | "long";  // Optional: Default "medium"
  summaryFormat?: "paragraph" | "bullets" | "key-points"; // Optional: Default "paragraph"
  detailLevel?: number;                      // Optional: 0-100, Default 50
}
```

**Response:**
```typescript
{
  status: 200,
  success: true,
  message: "Text summarized successfully",
  data: {
    summary: string;
    summaryLength: string;
    summaryFormat: string;
    detailLevel: number;
  }
}
```

## Frontend Integration

### API Service Layer

**File:** `src/services/api.service.ts`

The API service provides a centralized way to communicate with the backend:

```typescript
import { apiService } from "@/services/api.service";

// Summarize text
const response = await apiService.summarizeText({
  text: "Your text here",
  summaryLength: "medium",
  summaryFormat: "paragraph",
  detailLevel: 50
});
```

### Custom Hooks

**File:** `src/hooks/useSummarizer.ts`

The `useSummarizer` hook provides a clean interface for components:

```typescript
import { useSummarizer } from "@/hooks/useSummarizer";

const MyComponent = () => {
  const { summarize, loading, error } = useSummarizer({
    onSuccess: (summary) => {
      console.log("Summary:", summary);
    },
    onError: (error) => {
      console.error("Error:", error);
    }
  });

  const handleClick = async () => {
    try {
      const summary = await summarize({
        text: "Text to summarize",
        summaryLength: "medium"
      });
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? "Summarizing..." : "Summarize"}
    </button>
  );
};
```

## Configuration

### Environment Variables

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000/api/v1
```

**Backend (.env):**
```bash
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

## Updated Components

### Summarizer Component

**File:** `src/views/summarizer.tsx`

**Changes:**
- Replaced `useGemini` with `useSummarizer`
- Removed client-side prompt construction
- Now calls backend API endpoint
- Simplified error handling

**Before:**
```typescript
const { generateContent, loading, error } = useGemini();

const result = await generateContent({
  prompt: `Summarize the following text...`,
  type: PromptType.SUMMARIZER,
});
```

**After:**
```typescript
const { summarize, loading, error } = useSummarizer();

await summarize({
  text: input,
  summaryLength,
  summaryFormat,
  detailLevel: detailLevel[0],
});
```

## Benefits

### Security
- API keys no longer exposed in frontend code
- Server-side validation and sanitization
- Reduced attack surface

### Performance
- Server-side caching opportunities
- Connection pooling
- Optimized API calls

### Maintainability
- Centralized API logic
- Easier to update AI providers
- Consistent error handling
- Better monitoring and logging

### Scalability
- Rate limiting on server
- Request queuing
- Load balancing capabilities

## Error Handling

The API service includes comprehensive error handling:

```typescript
try {
  const response = await apiService.summarizeText(request);
  // Handle success
} catch (error) {
  // Error is automatically caught and formatted
  if (error instanceof Error) {
    console.error(error.message);
  }
}
```

Common error scenarios:
- **400 Bad Request:** Invalid or missing parameters
- **401 Unauthorized:** Authentication required
- **429 Too Many Requests:** Rate limit exceeded
- **500 Internal Server Error:** Server-side error

## Testing

### Backend Testing
```bash
# Test summarization endpoint
curl -X POST http://localhost:5000/api/v1/docxiq/research/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Your text here",
    "summaryLength": "medium",
    "summaryFormat": "paragraph",
    "detailLevel": 50
  }'
```

### Frontend Testing
1. Ensure backend is running on port 5000
2. Set `VITE_API_URL` in `.env`
3. Navigate to `/app/summarizer`
4. Test different summary configurations

## Future Enhancements

### Planned Features
- [ ] Paraphraser API integration
- [ ] Text expansion API integration
- [ ] Batch processing endpoints
- [ ] WebSocket support for streaming responses
- [ ] Authentication and user management
- [ ] Usage analytics and tracking
- [ ] Response caching

### Additional Endpoints (Coming Soon)

**Paraphrase:**
```
POST /docxiq/research/paraphrase
```

**Expand Text:**
```
POST /docxiq/research/expand
```

**Extract Keywords:**
```
POST /docxiq/research/keywords/extract
```

## Migration Guide

### For Other Features

To migrate other features from direct AI calls to backend API:

1. **Add endpoint to backend:**
   ```typescript
   // In research.support.controller.ts
   public static async yourFeature(req: Request, res: Response) {
     // Implementation
   }
   ```

2. **Add route:**
   ```typescript
   // In research.support.route.ts
   router.post("/your-feature", ResearchSupportController.yourFeature);
   ```

3. **Update API service:**
   ```typescript
   // In api.service.ts
   async yourFeature(request: YourRequest): Promise<YourResponse> {
     return this.request<YourResponse>("/docxiq/research/your-feature", {
       method: "POST",
       body: JSON.stringify(request),
     });
   }
   ```

4. **Create custom hook:**
   ```typescript
   // In hooks/useYourFeature.ts
   export const useYourFeature = () => {
     // Similar to useSummarizer
   };
   ```

5. **Update component:**
   ```typescript
   const { yourFeature, loading, error } = useYourFeature();
   ```

## Support

For issues or questions:
- Check backend logs for API errors
- Verify environment variables are set correctly
- Ensure backend service is running
- Review network requests in browser DevTools

## References

- Backend Service: `geo-soft/service/`
- API Controller: `service/src/controllers/docxiq/research.support.controller.ts`
- API Routes: `service/src/routes/docxiq/research.support.route.ts`
- Frontend Service: `documentiq/src/services/api.service.ts`
- Summarizer Hook: `documentiq/src/hooks/useSummarizer.ts`
