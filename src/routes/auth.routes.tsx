import Signin from "@/views/auth/signin";
import Signup from "@/views/auth/signup";
import ForgotPassword from "@/views/auth/forgot-password";
import GoogleCallback from "@/views/auth/google-callback";

export const authRoutes = [
    {
        path: "signin",
        element: <Signin/>
    },
    {
        path: "signup",
        element: <Signup/>
    },
    {
        path: "forgot-password",
        element: <ForgotPassword/>
    },
    {
        path: "google/callback",
        element: <GoogleCallback/>
    }
]