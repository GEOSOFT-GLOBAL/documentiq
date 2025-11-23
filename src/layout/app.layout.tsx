import { Outlet, Link, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const AppLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/app", label: "Dashboard" },
    { path: "/app/paraphraser", label: "Paraphraser" },
    { path: "/app/converter", label: "Converter" },
    { path: "/app/editor", label: "Editor" },
    { path: "/app/summarizer", label: "Summarizer" },
  ];

  return (
    <div className="flex min-h-screen gap-4 p-4 bg-background">
      <Card className="w-44 p-4 h-fit sticky top-4">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">DocumentIQ</h2>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "block px-3 py-2 rounded-md hover:bg-accent transition-colors",
                  location.pathname === item.path && "bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Card>

      <Card className="flex-1 p-4 ">
        <Outlet />
      </Card>
    </div>
  );
};

export default AppLayout;
