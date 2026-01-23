import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FileText,
  ArrowRightLeft,
  Sparkles,
  RefreshCw,
  GitCompare,
  Type,
  BarChart3,
  Key,
  Quote,
  Languages,
  QrCode,
  ArrowRight,
} from "lucide-react";

const tools = [
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Write in Markdown, HTML, or visual editor",
    path: "/app/editor",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: ArrowRightLeft,
    title: "Document Converter",
    description: "Convert between MD, HTML, PDF, LaTeX",
    path: "/app/converter",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Summarizer",
    description: "Get instant AI-powered summaries",
    path: "/app/summarizer",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: RefreshCw,
    title: "AI Paraphraser",
    description: "Rewrite text in different styles",
    path: "/app/paraphraser",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: GitCompare,
    title: "Diff Compare",
    description: "Compare texts and find differences",
    path: "/app/diff-compare",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Type,
    title: "Text Utilities",
    description: "Case converter, cleaner, counter",
    path: "/app/text-utilities",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
  {
    icon: BarChart3,
    title: "Readability",
    description: "Analyze text readability scores",
    path: "/app/readability-analyzer",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
  },
  {
    icon: Key,
    title: "Keywords",
    description: "Extract and analyze keywords",
    path: "/app/keyword-extractor",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: Quote,
    title: "Citations",
    description: "Generate APA, MLA, Chicago citations",
    path: "/app/citation-generator",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
  },
  {
    icon: Languages,
    title: "Translator",
    description: "Translate between 35+ languages",
    path: "/app/translator",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
  },
  {
    icon: QrCode,
    title: "QR Generator",
    description: "Create QR codes for any content",
    path: "/app/qr-generator",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
  },
];

const Dashboard = () => {
  return (
    <div className="h-full p-3 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome to DocumentIQ
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your all-in-one document processing toolkit. Select a tool to get
          started.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">
              Available Tools
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">
              {tools.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">
              AI-Powered
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">4</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2 p-3 sm:p-6">
            <CardDescription className="text-xs sm:text-sm">
              Free to Use
            </CardDescription>
            <CardTitle className="text-2xl sm:text-3xl">100%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tools Grid */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
          All Tools
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool) => (
            <Link key={tool.path} to={tool.path}>
              <Card className="h-full hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-3 sm:p-4">
                  <div
                    className={`inline-flex p-2 rounded-lg ${tool.bgColor} mb-2 sm:mb-3`}
                  >
                    <tool.icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${tool.color}`}
                    />
                  </div>
                  <h3 className="font-semibold mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                  <div className="mt-2 sm:mt-3 flex items-center text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Open tool <ArrowRight className="ml-1 h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="bg-muted/50">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-base sm:text-lg">💡 Quick Tips</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
            <li>
              • Use the <strong>AI Summarizer</strong> to quickly digest long
              documents
            </li>
            <li>
              • The <strong>Citation Generator</strong> supports PDF metadata
              extraction
            </li>
            <li>
              • <strong>Text Utilities</strong> includes case conversion,
              cleaning, and word counting
            </li>
            <li>
              • Generate <strong>QR codes</strong> for WiFi, URLs, emails, and
              more
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
