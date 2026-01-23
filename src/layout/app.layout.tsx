import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Settings, Menu, X } from "lucide-react";
import { useState } from "react";

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    { path: "/app/csv-converter", label: "CSV Converter" },
  ];

  return (
    <div className="flex min-h-screen gap-0 md:gap-4 p-0 md:p-4 bg-background relative">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          <h2 className="text-lg font-semibold">DocumentIQ</h2>
          <Link to="/app/settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                location.pathname === "/app/settings" && "bg-accent",
              )}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Card
        className={cn(
          "w-64 md:w-44 p-4 h-fit md:sticky md:top-4 z-50",
          "fixed top-0 left-0 bottom-0 md:relative transition-transform duration-300",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="space-y-4">
          <h2 className="text-lg font-semibold hidden md:block">DocumentIQ</h2>
          <nav className="space-y-2 mt-16 md:mt-0">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "block px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm",
                  location.pathname === item.path && "bg-accent",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </Card>

      {/* Settings Icon - Desktop Only */}
      <Link
        to="/app/settings"
        className="hidden md:block fixed m-5 top-4 right-4 z-50"
      >
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "rounded-full",
            location.pathname === "/app/settings" && "bg-accent",
          )}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </Link>

      {/* Main Content */}
      <Card className="flex-1 p-4 md:p-6 mt-16 md:mt-0 rounded-none md:rounded-lg">
        <Outlet />
      </Card>
    </div>
  );
};

export default AppLayout;
