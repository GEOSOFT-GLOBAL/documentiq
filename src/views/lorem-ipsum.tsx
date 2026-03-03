import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, RefreshCw, Download } from "lucide-react";
import { toast } from "sonner";

type LoremType = "paragraphs" | "sentences" | "words" | "bytes";

const loremIpsumTexts: Record<LoremType, string> = {
  paragraphs: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur?`,
  sentences: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
  words: `lorem ipsum dolor sit amet consectetur adipiscing elit sed eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur`,
  bytes: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.`,
};

const LoremIpsumGenerator = () => {
  const [loremType, setLoremType] = useState<LoremType>("paragraphs");
  const [count, setCount] = useState([3]);
  const [output, setOutput] = useState("");

  const generateLoremIpsum = () => {
    let result = "";
    const baseText = loremIpsumTexts[loremType];
    
    switch (loremType) {
      case "paragraphs": {
        const paragraphs = baseText.split("\n\n");
        for (let i = 0; i < count[0]; i++) {
          result += paragraphs[i % paragraphs.length] + "\n\n";
        }
        break;
      }
      case "sentences": {
        const sentences = baseText.split(". ");
        for (let i = 0; i < count[0]; i++) {
          result += sentences[i % sentences.length] + (i < count[0] - 1 ? ". " : ".");
        }
        break;
      }
      case "words": {
        const words = baseText.split(" ");
        const selectedWords = [];
        for (let i = 0; i < count[0]; i++) {
          selectedWords.push(words[i % words.length]);
        }
        result = selectedWords.join(" ");
        break;
      }
      case "bytes": {
        const bytes = Math.min(count[0], 100);
        result = baseText.substring(0, bytes);
        if (result.length < bytes) {
          result = result.padEnd(bytes, " ");
        }
        break;
      }
    }
    
    setOutput(result.trim());
    toast.success("Lorem Ipsum generated!");
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
    a.download = "lorem-ipsum.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto">
      <div className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Lorem Ipsum Generator</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Generate placeholder text for your designs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1">
        {/* Options Card */}
        <Card>
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">Options</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Configure your Lorem Ipsum output
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm">Type</Label>
              <Select
                value={loremType}
                onValueChange={(v) => setLoremType(v as LoremType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paragraphs">Paragraphs</SelectItem>
                  <SelectItem value="sentences">Sentences</SelectItem>
                  <SelectItem value="words">Words</SelectItem>
                  <SelectItem value="bytes">Bytes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm">
                Count: {count[0]} {loremType}
              </Label>
              <Slider
                value={count}
                onValueChange={setCount}
                min={1}
                max={loremType === "bytes" ? 100 : 20}
                step={1}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={generateLoremIpsum} size="sm">
                <RefreshCw className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Generate</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleCopy}
                disabled={!output}
                size="sm"
              >
                <Copy className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button
                variant="outline"
                onClick={handleDownload}
                disabled={!output}
                size="sm"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Output Card */}
        <Card className="flex flex-col">
          <CardHeader className="pb-3 md:pb-4">
            <CardTitle className="text-base md:text-lg">Output</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Your generated Lorem Ipsum text
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-0">
            <Textarea
              value={output}
              readOnly
              className="h-full min-h-[200px] md:min-h-[300px] resize-none font-mono text-xs md:text-sm"
              placeholder="Click 'Generate' to create Lorem Ipsum text..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoremIpsumGenerator;
