import { Link } from "react-router-dom";
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

const features = [
  {
    icon: FileText,
    title: "Rich Text Editor",
    description: "Write in Markdown, HTML, or use our visual editor with equations and flowcharts.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    path: "/app/editor",
  },
  {
    icon: ArrowRightLeft,
    title: "Document Converter",
    description: "Convert between Markdown, HTML, PDF, and LaTeX formats instantly.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    path: "/app/converter",
  },
  {
    icon: Sparkles,
    title: "AI Summarizer",
    description: "Get instant summaries of long documents with AI-powered analysis.",
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    path: "/app/summarizer",
  },
  {
    icon: RefreshCw,
    title: "AI Paraphraser",
    description: "Rewrite text in different tones and styles while keeping the meaning.",
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    path: "/app/paraphraser",
  },
  {
    icon: GitCompare,
    title: "Text Diff & Compare",
    description: "Compare two texts side-by-side and highlight all differences.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    path: "/app/diff-compare",
  },
  {
    icon: Type,
    title: "Text Utilities",
    description: "Case converter, text cleaner, word counter, and more text tools.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
    path: "/app/text-utilities",
  },
  {
    icon: BarChart3,
    title: "Readability Analyzer",
    description: "Analyze text readability with Flesch-Kincaid and other metrics.",
    color: "text-indigo-500",
    bgColor: "bg-indigo-500/10",
    path: "/app/readability-analyzer",
  },
  {
    icon: Key,
    title: "Keyword Extractor",
    description: "Extract important keywords and analyze keyword density.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    path: "/app/keyword-extractor",
  },
  {
    icon: Quote,
    title: "Citation Generator",
    description: "Generate citations in APA, MLA, Chicago, and more formats.",
    color: "text-rose-500",
    bgColor: "bg-rose-500/10",
    path: "/app/citation-generator",
  },
  {
    icon: Languages,
    title: "Language Translator",
    description: "Translate text between 35+ languages instantly.",
    color: "text-teal-500",
    bgColor: "bg-teal-500/10",
    path: "/app/translator",
  },
  {
    icon: QrCode,
    title: "QR Code Generator",
    description: "Create QR codes for URLs, text, WiFi, emails, and more.",
    color: "text-violet-500",
    bgColor: "bg-violet-500/10",
    path: "/app/qr-generator",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Tools for Every Need
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From writing and editing to converting and analyzing, DocumentIQ has everything you need to work with documents efficiently.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.path}
              className="group p-6 rounded-xl bg-card border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.bgColor} mb-4`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>
              <span className="inline-flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Try it now
                <ArrowRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link
            to="/app"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Explore All Tools
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Features;
