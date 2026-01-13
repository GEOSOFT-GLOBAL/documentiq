import Login from "@/views/auth/login";
import Signup from "@/views/auth/signup";

export const authRoutes = [
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "signup",
    element: <Signup />,
  },
];
