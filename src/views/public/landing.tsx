import { Link } from "react-router-dom";
import { FileText, Zap, Share2, Link2, ArrowRight, Shrink } from "lucide-react";
import { Button } from "@/components/ui/button";

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
          <Zap className="h-4 w-4" />
          No contacts needed — just share a link
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Convert, Compress & <span className="text-primary">Share</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mb-10">
          Transform your files, shrink their size, and share them instantly via
          a personal web link. No need to exchange contacts — anyone with the
          link can access your files.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/auth/signin">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to="/about">Learn More</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-4">
            Everything You Need
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-xl mx-auto">
            A complete toolkit for handling your files — convert formats,
            reduce sizes, and share effortlessly.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-lg bg-background border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">File Conversion</h3>
              <p className="text-sm text-muted-foreground">
                Convert documents, images, and text between multiple formats
                seamlessly.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-background border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Shrink className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Compression</h3>
              <p className="text-sm text-muted-foreground">
                Reduce file sizes without sacrificing quality. Perfect for
                sharing large files.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-background border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Link2 className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Personal Links</h3>
              <p className="text-sm text-muted-foreground">
                Get your own shareable link. No contact exchange required —
                just send the URL.
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-background border">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Share2 className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Instant Sharing</h3>
              <p className="text-sm text-muted-foreground">
                Share files in seconds. Recipients access them directly — no
                sign-up needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-semibold text-center mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="font-medium mb-2">Upload Your File</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop or select files from your device.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="font-medium mb-2">Convert or Compress</h3>
              <p className="text-sm text-muted-foreground">
                Choose your desired format or compression level.
              </p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="font-medium mb-2">Share the Link</h3>
              <p className="text-sm text-muted-foreground">
                Get a personal link and share it with anyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary text-primary-foreground">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to simplify file sharing?
          </h2>
          <p className="mb-8 opacity-90">
            Join thousands of users who share files without the hassle.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/auth/signin">
              Start Sharing Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
