# DocumentiQ

DocumentiQ is a modern, all-in-one document intelligence platform designed to help users create, edit, and manage documents with advanced AI-powered features. Built with React, TypeScript, and Vite, it offers a fast and intuitive user experience.

## ✨ Features

- **Advanced Text Editor:** A powerful, feature-rich text editor with support for rich formatting, code blocks, and more.
- **AI-Powered Tools:** Leverage AI for document summarization, translation, and content generation.
- **Mathematical Equations:** Create and edit complex mathematical equations using LaTeX and MathML.
- **Citation Management:** Generate and format citations in various styles (APA, MLA, Chicago, etc.).
- **File Conversion:** Convert documents between various formats including DOCX, PDF, and CSV.
- **Document Comparison:** Compare and highlight differences between two documents.
- **Responsive Design:** Fully responsive layout that works on all devices.
- **Dark/Light Mode:** Customizable themes with support for both dark and light modes.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [pnpm](https://pnpm.io/) (or your preferred package manager)

### Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/your-username/documentiq.git
   ```
2. Navigate to the project directory:
   ```sh
   cd documentiq
   ```
3. Install the dependencies:
   ```sh
   pnpm install
   ```
4. Build the WASM converter module:
   ```sh
   pnpm build:wasm
   ```
5. Start the development server:
   ```sh
   pnpm run dev
   ```

The application should now be running on `http://localhost:5173`.

## 📂 App Structure

The project follows a modular structure to keep the codebase organized and maintainable.

```
/src
├── /assets         # Static assets (images, fonts)
├── /components     # Reusable UI components
│   ├── /ui         # Components from shadcn/ui
│   ├── /citation   # Citation management components
│   ├── /editors    # Editor components (code, equation, flow chart)
│   ├── /tiptap-*   # Tiptap editor related components and primitives
│   ├── /landing    # Landing page components
│   └── theme-provider.tsx
├── /hooks          # Custom React hooks
├── /layout         # Application layout components
├── /lib            # Utility functions and library configurations
├── /routes         # Routing configuration (React Router)
├── /services       # API and service integration
├── /store          # Global state management (Zustand)
├── /styles         # Global styles and SCSS variables
├── /utils          # Helper functions for various operations
├── /views          # Application pages/views
├── constants.ts    # Application constants
├── main.tsx        # Main application entry point
└── index.css       # Global styles
```

## 🧩 Main Components

- **`ThemeProvider`**: Manages the application's theme (light/dark mode) and provides it to all components.
- **`RouterProvider`**: Handles client-side routing using `react-router-dom`. The routes are defined in the `/routes` directory.
- **`AppLayout`**: The main layout component that includes navigation, sidebar, and content area.
- **Text Editor**: Powered by Tiptap, a headless rich text editor that provides a customizable experience.
- **Equation Editor**: Allows users to create and edit mathematical equations using LaTeX.
- **Citation Generator**: Generates citations in various styles and manages citation lists.
- **Document Converter**: Converts documents between different formats using a WASM module.
- **UI Components (`/components/ui`)**: A collection of reusable UI components built using shadcn/ui.

## 🛠️ Built With

- [Vite](https://vitejs.dev/) - Next-generation front-end tooling.
- [React](https://react.dev/) - A JavaScript library for building user interfaces.
- [TypeScript](https://www.typescriptlang.org/) - A typed superset of JavaScript.
- [React Router](https://reactrouter.com/) - Declarative routing for React applications.
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
- [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
- [Tiptap](https://tiptap.dev/) - A headless rich text editor for React.
- [Zustand](https://zustand-demo.pmnd.rs/) - A small, fast state management library for React.
- [Google GenAI](https://ai.google.dev/) - AI-powered features for document analysis and generation.

## 📚 Additional Information

- **WASM Module**: The project uses a Rust-based WASM module for document conversion. Run `pnpm build:wasm` to build the module.
- **Husky**: Pre-commit hooks are configured using Husky to ensure code quality.
- **ESLint**: The project uses ESLint for linting with TypeScript support.

For more information about the project structure and features, please refer to the source code documentation.
