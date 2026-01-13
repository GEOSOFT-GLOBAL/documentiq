import AppLayout from "@/layout/app.layout";
import AuthLayout from "@/layout/auth.layout";
import ErrorView from "@/views/error-view";
import Landing from "@/views/landing";
import { createHashRouter } from "react-router-dom";
import { appRoutes } from "./app.routes";
import { authRoutes } from "./auth.routes";

export const routes = createHashRouter([
  {
    path: "/",
    element: <Landing />,
    errorElement: <ErrorView />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: authRoutes,
  },
  {
    path: "/app",
    element: <AppLayout />,
    children: [...appRoutes],
  },
]);
