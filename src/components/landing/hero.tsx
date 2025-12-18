import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { BackgroundBeams } from "../ui/background-beams";
import { ArrowRight, FileText, Sparkles, Zap } from "lucide-react";

const Hero = () => {
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      <BackgroundBeams />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI-Powered Document Tools</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Transform Your
          <span className="bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
            {" "}
            Documents{" "}
          </span>
          with AI
        </h1>

        {/* Subheading */}
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-10">
          Edit, convert, summarize, paraphrase, and analyze your documents with
          powerful AI tools. All in one place, completely free.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Button asChild size="lg" className="text-lg px-8 py-6">
            <Link to="/app">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6"
          >
            <a href="#features">Explore Features</a>
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur border">
            <div className="p-2 rounded-md bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-semibold">Rich Text Editor</p>
              <p className="text-sm text-muted-foreground">
                Markdown, HTML & more
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur border">
            <div className="p-2 rounded-md bg-purple-500/10">
              <Sparkles className="h-5 w-5 text-purple-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold">AI Summarizer</p>
              <p className="text-sm text-muted-foreground">Instant summaries</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-lg bg-card/50 backdrop-blur border">
            <div className="p-2 rounded-md bg-pink-500/10">
              <Zap className="h-5 w-5 text-pink-500" />
            </div>
            <div className="text-left">
              <p className="font-semibold">15+ Tools</p>
              <p className="text-sm text-muted-foreground">
                All-in-one platform
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
