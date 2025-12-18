import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings } from "lucide-react";

const AppLayout = () => {
  const location = useLocation();

  const navItems = [
    { path: "/app", label: "Dashboard" },
    { path: "/app/editor", label: "Editor" },
    { path: "/app/converter", label: "Converter" },
    { path: "/app/summarizer", label: "Summarizer" },
    { path: "/app/paraphraser", label: "Paraphraser" },
    { path: "/app/diff-compare", label: "Diff Compare" },
    { path: "/app/text-utilities", label: "Text Utilities" },
    { path: "/app/readability-analyzer", label: "Readability" },
    { path: "/app/keyword-extractor", label: "Keywords" },
    { path: "/app/citation-generator", label: "Citations" },
    { path: "/app/translator", label: "Translator" },
    { path: "/app/qr-generator", label: "QR Code" },
  ];

  return (
    <div className="flex min-h-screen gap-4 p-4 bg-background relative">
      {/* Settings Icon - Fixed Top Right */}
      <Link to="/app/settings" className="fixed m-5 top-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full",
            location.pathname === "/app/settings" && "bg-accent"
          )}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </Link>
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
