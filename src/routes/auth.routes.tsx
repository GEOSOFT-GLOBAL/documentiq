import Login from "@/views/auth/login";
import Signup from "@/views/auth/signup";
import GoogleCallback from "@/views/auth/google-callback";

export const authRoutes = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
  {
    path: "google/callback",
    element: <GoogleCallback />,
  },
];
