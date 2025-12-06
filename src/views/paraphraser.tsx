import { useState } from "react";
import { useGemini, PromptType } from "@/hooks/useGemini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Sparkles, RotateCcw, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ToneType = "professional" | "casual" | "academic" | "creative" | "simple";

const Paraphraser = () => {
  const { generateContent, loading, error } = useGemini();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [tone, setTone] = useState<ToneType>("professional");
  const [creativity, setCreativity] = useState([50]);
  const [activeTab, setActiveTab] = useState<
    "paraphrase" | "summarize" | "expand"
  >("paraphrase");

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error("Please enter some text to paraphrase");
      return;
    }

    try {
      let prompt = "";

      switch (activeTab) {
        case "paraphrase":
          prompt = `Paraphrase the following text in a ${tone} tone. Maintain the original meaning but use different words and sentence structures:\n\n${input}`;
          break;
        case "summarize":
          prompt = `Summarize the following text concisely in a ${tone} tone:\n\n${input}`;
          break;
        case "expand":
          prompt = `Expand and elaborate on the following text in a ${tone} tone, adding more details and context:\n\n${input}`;
          break;
      }

      const result = await generateContent({
        prompt,
        type:
          activeTab === "summarize"
            ? PromptType.SUMMARIZER
            : PromptType.PARAPHRASER,
      });

      setOutput(result);
      toast.success("Generated successfully!");
    } catch (err) {
      toast.error(
        `Generation failed: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const handleCopy = () => {
    if (!output) {
      toast.error("No output to copy");
      return;
    }

    navigator.clipboard.writeText(output);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!output) {
      toast.error("No output to download");
      return;
    }

    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}-output.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleReset = () => {
    setInput("");
    setOutput("");
    toast.info("Reset complete");
  };

  const loadExample = () => {
    const examples = {
      paraphrase:
        "Artificial intelligence is transforming the way we work and live. It has applications in healthcare, finance, education, and many other fields. As AI continues to evolve, it's important to consider both its benefits and potential challenges.",
      summarize:
        "Climate change is one of the most pressing issues of our time. Rising global temperatures are causing ice caps to melt, sea levels to rise, and weather patterns to become more extreme. Scientists agree that human activities, particularly the burning of fossil fuels, are the primary cause. To address this crisis, we need to reduce greenhouse gas emissions, transition to renewable energy sources, and implement sustainable practices across all sectors of society. Individual actions, such as reducing energy consumption and supporting eco-friendly businesses, can also make a difference.",
      expand: "AI is changing education.",
    };

    setInput(examples[activeTab]);
    setOutput("");
  };

  const wordCount = input.trim() ? input.trim().split(/\s+/).length : 0;
  const outputWordCount = output.trim() ? output.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Text Paraphraser</h1>
        <p className="text-muted-foreground">
          Rewrite, summarize, or expand your text with AI-powered assistance
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as typeof activeTab)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="paraphrase">
            <Sparkles className="h-4 w-4 mr-2" />
            Paraphrase
          </TabsTrigger>
          <TabsTrigger value="summarize">
            <Sparkles className="h-4 w-4 mr-2" />
            Summarize
          </TabsTrigger>
          <TabsTrigger value="expand">
            <Sparkles className="h-4 w-4 mr-2" />
            Expand
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Settings</CardTitle>
          <CardDescription>Customize the output style and tone</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select
                value={tone}
                onValueChange={(v) => setTone(v as ToneType)}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="simple">Simple</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creativity">
                Creativity Level: {creativity[0]}%
              </Label>
              <Slider
                id="creativity"
                value={creativity}
                onValueChange={setCreativity}
                max={100}
                step={10}
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleGenerate} disabled={loading || !input.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Generate
            </>
          )}
        </Button>
        <Button onClick={loadExample} variant="outline">
          Load Example
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleCopy} variant="outline" disabled={!output}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button onClick={handleDownload} variant="outline" disabled={!output}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md">
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Label>Input Text</Label>
            <span className="text-xs text-muted-foreground">
              {wordCount} words
            </span>
          </div>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 resize-none font-mono text-sm"
            placeholder="Enter or paste your text here..."
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Label>Output</Label>
            <span className="text-xs text-muted-foreground">
              {outputWordCount} words
            </span>
          </div>
          <Textarea
            value={output}
            readOnly
            className="flex-1 resize-none font-mono text-sm bg-muted"
            placeholder="Generated text will appear here..."
          />
        </div>
      </div>
    </div>
  );
};

export default Paraphraser;
