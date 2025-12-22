import "./index.css";
import { StrictMode } from "react";
import { routes } from "./routes/router.tsx";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <RouterProvider router={routes}/>
    </ThemeProvider>
  </StrictMode>
);
