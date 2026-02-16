# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added

#### API Integration (2024)

- **Zustand Stores for API Integration**
  - `useSummarizerStore` (`src/store/summarizerStore.ts`)
    - Centralized state management for text summarization
    - Integrates with backend summarization endpoint
    - Built-in loading and error states
  - `useCitationStore` (`src/store/citationStore.ts`)
    - State management for citation generation features
    - Support for multiple citation generation methods
    - Citation format conversion support



### Changed

#### Summarizer Feature

- **Updated Summarizer Component** (`src/views/summarizer.tsx`)
  - Migrated from direct Gemini API calls to backend service API
  - Replaced `useGemini` hook with `useSummarizer` hook
  - Removed client-side prompt construction logic
  - Simplified error handling with callbacks
  - Maintained all existing UI/UX functionality

### Security

- **API Key Protection**
  - Removed API key exposure from frontend
  - Moved sensitive keys to backend service
  - Reduced client-side attack surface

#### Citation Generator Feature

- **Updated Citation Generator Component** (`src/views/citation-generator.tsx`)
  - Migrated from direct Gemini API calls to backend service API
  - Replaced `useGemini` hook with `useCitationStore` hook
  - Integrated four backend endpoints:
    - Generate citation from source info
    - Generate citation from document
    - Generate citation from URL
    - Convert citations between formats
  - Removed client-side prompt construction
  - Maintained all existing UI/UX functionality
  - Improved error handling with store-based state management

### Improved

- **Architecture**
  - Centralized AI provider integration on backend
  - Better separation of concerns
  - Easier to maintain and update
  - Prepared for future scalability

- **Error Handling**
  - Consistent error messages across application
  - Better error propagation from backend
  - User-friendly error notifications

### Technical Details

**Backend Integration - Summarizer:**
- Endpoint: `POST /api/v1/docxiq/research/summarize`
- Controller: `ResearchSupportController.summarizeText`
- Route: `/docxiq/research/summarize`

**Backend Integration - Citation Generator:**
- Endpoint: `POST /api/v1/docxiq/research/citation/generate`
- Endpoint: `POST /api/v1/docxiq/research/citation/from-document`
- Endpoint: `POST /api/v1/docxiq/research/citation/from-url`
- Endpoint: `POST /api/v1/docxiq/research/citation/convert`
- Controller: `ResearchSupportController` (multiple methods)
- Routes: `/docxiq/research/citation/*`

**Frontend Changes:**
- Zustand store-based state management
- Type-safe interfaces throughout
- Centralized API communication logic
- Consistent error handling across features
- Maintained backward compatibility with UI

**Environment Variables:**
- Frontend: `VITE_API_URL` (default: http://localhost:5000/api/v1)
- Backend: `GEMINI_API_KEY` (server-side only)

### Migration Impact

- **Breaking Changes:** None for end users
- **Developer Changes:** 
  - Must run backend service for summarizer and citation generator to work
  - Update `.env` with `VITE_API_URL` if using custom backend URL
  - `useGemini` hook deprecated for summarizer and citation generator (still available for other features)
  - Follow Zustand store pattern for future API integrations

### Future Enhancements

- [ ] Migrate Paraphraser to backend API
- [ ] Migrate Text Expander to backend API
- [ ] Add authentication and user management
- [ ] Implement request caching
- [ ] Add WebSocket support for streaming
- [ ] Usage analytics and rate limiting
- [ ] Batch processing support

### Notes

This update represents Phase 1-2 of migrating all AI features to the backend service. The Summarizer and Citation Generator serve as proof-of-concept for this architectural change using Zustand stores for state management. Other features (Paraphraser, Keyword Extractor, etc.) will follow the same pattern in future updates.

---

## Previous Versions

(Previous changelog entries would go here)