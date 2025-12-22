import About from "@/views/public/about";
import Home from "@/views/public/landing";

export const publicRoutes = [
    {
        index: true,
        element: <Home/>
    },
    {
        path: "about",
        element: <About/>
    }
]