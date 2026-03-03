import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Settings,
  Menu,
  X,
  LayoutDashboard,
  FileEdit,
  ArrowRightLeft,
  Sparkles,
  RefreshCw,
  GitCompare,
  FileText,
  Eye,
  Tags,
  Quote,
  Globe,
  QrCode,
  Table,
  History,
  Type,
} from "lucide-react";
import { useState } from "react";

const AppLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { path: "/app", label: "Dashboard", icon: LayoutDashboard },
    { path: "/app/editor", label: "Editor", icon: FileEdit },
    { path: "/app/converter", label: "Converter", icon: ArrowRightLeft },
    { path: "/app/summarizer", label: "Summarizer", icon: Sparkles },
    { path: "/app/paraphraser", label: "Paraphraser", icon: RefreshCw },
    { path: "/app/diff-compare", label: "Diff Compare", icon: GitCompare },
    { path: "/app/text-utilities", label: "Text Utilities", icon: FileText },
    { path: "/app/readability-analyzer", label: "Readability", icon: Eye },
    { path: "/app/keyword-extractor", label: "Keywords", icon: Tags },
    { path: "/app/citation-generator", label: "Citations", icon: Quote },
    { path: "/app/translator", label: "Translator", icon: Globe },
    { path: "/app/qr-generator", label: "QR Code", icon: QrCode },
    { path: "/app/csv-converter", label: "CSV Converter", icon: Table },
    { path: "/app/lorem-ipsum", label: "Lorem Ipsum", icon: Type },
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
          <div className="flex items-center gap-2">
            <Link to="/app/history">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  location.pathname === "/app/history" && "bg-accent",
                )}
              >
                <History className="h-5 w-5" />
              </Button>
            </Link>
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
          "w-64 md:w-44 p-0 md:p-4 h-fit md:sticky md:top-4 z-50",
          "fixed top-0 left-0 bottom-0 md:relative transition-transform duration-300 rounded-none md:rounded-lg",
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="space-y-2 md:space-y-4 p-3 md:p-0">
          <h2 className="text-lg font-semibold hidden md:block px-2">DocumentIQ</h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors text-sm",
                    location.pathname === item.path && "bg-accent",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Settings & History Icons - Desktop Only */}
      <div className="hidden md:flex fixed m-5 top-4 right-4 z-50 gap-2">
        <Link to="/app/history">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "rounded-full",
              location.pathname === "/app/history" && "bg-accent",
            )}
          >
            <History className="h-5 w-5" />
          </Button>
        </Link>
        <Link to="/app/settings">
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
      </div>

      {/* Main Content */}
      <Card className="flex-1 p-3 md:p-6 mt-16 md:mt-0 rounded-none md:rounded-lg">
        <Outlet />
      </Card>
    </div>
  );
};

export default AppLayout;
