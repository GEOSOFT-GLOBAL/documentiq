import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Copy,
  GitCompare,
  RotateCcw,
  Download,
  Upload,
  ArrowLeftRight,
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ViewMode = "side-by-side" | "unified";
type DiffType = "added" | "removed" | "unchanged" | "modified";

interface DiffLine {
  type: DiffType;
  leftLine?: string;
  rightLine?: string;
  leftLineNum?: number;
  rightLineNum?: number;
}

const DiffCompare = () => {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);

  const computeDiff = useMemo(() => {
    if (!leftText && !rightText) return [];

    let leftLines = leftText.split("\n");
    let rightLines = rightText.split("\n");

    // Apply filters
    if (ignoreWhitespace) {
      leftLines = leftLines.map((line) => line.trim());
      rightLines = rightLines.map((line) => line.trim());
    }

    if (ignoreCase) {
      leftLines = leftLines.map((line) => line.toLowerCase());
      rightLines = rightLines.map((line) => line.toLowerCase());
    }

    const diff: DiffLine[] = [];
    const maxLines = Math.max(leftLines.length, rightLines.length);

    for (let i = 0; i < maxLines; i++) {
      const leftLine = i < leftLines.length ? leftLines[i] : undefined;
      const rightLine = i < rightLines.length ? rightLines[i] : undefined;

      if (leftLine === undefined && rightLine !== undefined) {
        diff.push({
          type: "added",
          rightLine,
          rightLineNum: i + 1,
        });
      } else if (leftLine !== undefined && rightLine === undefined) {
        diff.push({
          type: "removed",
          leftLine,
          leftLineNum: i + 1,
        });
      } else if (leftLine === rightLine) {
        diff.push({
          type: "unchanged",
          leftLine,
          rightLine,
          leftLineNum: i + 1,
          rightLineNum: i + 1,
        });
      } else {
        diff.push({
          type: "modified",
          leftLine,
          rightLine,
          leftLineNum: i + 1,
          rightLineNum: i + 1,
        });
      }
    }

    return diff;
  }, [leftText, rightText, ignoreWhitespace, ignoreCase]);

  const stats = useMemo(() => {
    const added = computeDiff.filter((d) => d.type === "added").length;
    const removed = computeDiff.filter((d) => d.type === "removed").length;
    const modified = computeDiff.filter((d) => d.type === "modified").length;
    const unchanged = computeDiff.filter((d) => d.type === "unchanged").length;

    return { added, removed, modified, unchanged, total: computeDiff.length };
  }, [computeDiff]);

  // Helper function to highlight word differences
  const highlightWordDifferences = (
    text1: string,
    text2: string,
    side: "left" | "right"
  ) => {
    const words1 = text1.split(/(\s+)/);
    const words2 = text2.split(/(\s+)/);

    const maxLength = Math.max(words1.length, words2.length);
    const result: React.ReactNode[] = [];

    for (let i = 0; i < maxLength; i++) {
      const word1 = words1[i] || "";
      const word2 = words2[i] || "";
      const currentWord = side === "left" ? word1 : word2;
      const otherWord = side === "left" ? word2 : word1;

      if (currentWord !== otherWord && currentWord.trim() !== "") {
        result.push(
          <span
            key={i}
            className="bg-yellow-300 dark:bg-yellow-700 px-0.5 rounded"
          >
            {currentWord}
          </span>
        );
      } else {
        result.push(<span key={i}>{currentWord}</span>);
      }
    }

    return result;
  };

  const handleSwap = () => {
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    toast.info("Texts swapped");
  };

  const handleReset = () => {
    setLeftText("");
    setRightText("");
    toast.info("Reset complete");
  };

  const handleCopyDiff = () => {
    const diffText = computeDiff
      .map((line) => {
        if (line.type === "added") return `+ ${line.rightLine}`;
        if (line.type === "removed") return `- ${line.leftLine}`;
        if (line.type === "modified")
          return `~ ${line.leftLine} → ${line.rightLine}`;
        return `  ${line.leftLine}`;
      })
      .join("\n");

    navigator.clipboard.writeText(diffText);
    toast.success("Diff copied to clipboard!");
  };

  const handleDownloadDiff = () => {
    const diffText = computeDiff
      .map((line) => {
        if (line.type === "added") return `+ ${line.rightLine}`;
        if (line.type === "removed") return `- ${line.leftLine}`;
        if (line.type === "modified")
          return `~ ${line.leftLine} → ${line.rightLine}`;
        return `  ${line.leftLine}`;
      })
      .join("\n");

    const blob = new Blob([diffText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diff-output.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleFileUpload =
    (side: "left" | "right") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (side === "left") {
          setLeftText(text);
        } else {
          setRightText(text);
        }
        toast.success(`File loaded to ${side} side`);
      };
      reader.onerror = () => {
        toast.error("Failed to read file");
      };
      reader.readAsText(file);
    };

  const loadExample = () => {
    setLeftText(`function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price;
  }
  return total;
}

const user = {
  name: "John",
  age: 30
};`);

    setRightText(`function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

const user = {
  name: "John",
  age: 30,
  email: "john@example.com"
};`);
  };

  const getLineColor = (type: DiffType) => {
    switch (type) {
      case "added":
        return "bg-green-100 dark:bg-green-950 border-l-4 border-green-500";
      case "removed":
        return "bg-red-100 dark:bg-red-950 border-l-4 border-red-500";
      case "modified":
        return "bg-yellow-100 dark:bg-yellow-950 border-l-4 border-yellow-500";
      default:
        return "bg-background";
    }
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Text Diff & Compare</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Compare two texts side-by-side and visualize the differences
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Comparison Settings</CardTitle>
          <CardDescription>Configure how texts are compared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="whitespace">Ignore Whitespace</Label>
              <p className="text-xs text-muted-foreground">
                Ignore leading and trailing spaces
              </p>
            </div>
            <Switch
              id="whitespace"
              checked={ignoreWhitespace}
              onCheckedChange={setIgnoreWhitespace}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="case">Ignore Case</Label>
              <p className="text-xs text-muted-foreground">
                Case-insensitive comparison
              </p>
            </div>
            <Switch
              id="case"
              checked={ignoreCase}
              onCheckedChange={setIgnoreCase}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
          className="w-full sm:w-auto overflow-x-auto"
        >
          <TabsList className="flex w-full sm:w-auto">
            <TabsTrigger value="side-by-side" className="flex-shrink-0">
              <GitCompare className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="text-xs sm:text-sm">Side by Side</span>
            </TabsTrigger>
            <TabsTrigger value="unified" className="flex-shrink-0">Unified</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button onClick={loadExample} variant="outline" size="sm">
            <span className="hidden sm:inline">Load Example</span>
            <span className="sm:hidden">Example</span>
          </Button>
          <Button onClick={handleSwap} variant="outline" size="sm">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Swap
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleCopyDiff}
            variant="outline"
            size="sm"
            disabled={!leftText && !rightText}
          >
            <Copy className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Copy Diff</span>
          </Button>
          <Button
            onClick={handleDownloadDiff}
            variant="outline"
            size="sm"
            disabled={!leftText && !rightText}
          >
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      </div>

      {(leftText || rightText) && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-3 sm:gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Added: {stats.added}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Removed: {stats.removed}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span>Modified: {stats.modified}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-muted rounded"></div>
                <span>Unchanged: {stats.unchanged}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Original Text</Label>
            <Button variant="ghost" size="sm" asChild>
              <label htmlFor="left-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload
                <input
                  id="left-upload"
                  type="file"
                  accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md"
                  className="hidden"
                  onChange={handleFileUpload("left")}
                />
              </label>
            </Button>
          </div>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            className="w-full h-32 sm:h-48 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Paste or type original text here..."
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Modified Text</Label>
            <Button variant="ghost" size="sm" asChild>
              <label htmlFor="right-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Upload
                <input
                  id="right-upload"
                  type="file"
                  accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.html,.css,.json,.md"
                  className="hidden"
                  onChange={handleFileUpload("right")}
                />
              </label>
            </Button>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            className="w-full h-32 sm:h-48 p-3 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Paste or type modified text here..."
          />
        </div>
      </div>

      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col">
            <Label className="mb-2">Diff View - Original</Label>
            <div className="flex-1 border rounded-md overflow-auto">
              <div className="font-mono text-sm">
                {computeDiff.map((line, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-1 min-h-[24px] ${
                      line.type === "removed"
                        ? "bg-red-100 dark:bg-red-950 border-l-4 border-red-500"
                        : line.type === "modified"
                        ? "bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500"
                        : line.type === "added"
                        ? "bg-muted/50"
                        : "bg-background"
                    }`}
                  >
                    <span className="text-muted-foreground mr-4 inline-block w-8 text-right text-xs">
                      {line.leftLineNum}
                    </span>
                    {line.type === "modified" &&
                    line.leftLine &&
                    line.rightLine ? (
                      <span>
                        {highlightWordDifferences(
                          line.leftLine,
                          line.rightLine,
                          "left"
                        )}
                      </span>
                    ) : (
                      <span>{line.leftLine || ""}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <Label className="mb-2">Diff View - Modified</Label>
            <div className="flex-1 border rounded-md overflow-auto">
              <div className="font-mono text-sm">
                {computeDiff.map((line, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-1 min-h-[24px] ${
                      line.type === "added"
                        ? "bg-green-100 dark:bg-green-950 border-l-4 border-green-500"
                        : line.type === "modified"
                        ? "bg-yellow-50 dark:bg-yellow-950/30 border-l-4 border-yellow-500"
                        : line.type === "removed"
                        ? "bg-muted/50"
                        : "bg-background"
                    }`}
                  >
                    <span className="text-muted-foreground mr-4 inline-block w-8 text-right text-xs">
                      {line.rightLineNum}
                    </span>
                    {line.type === "modified" &&
                    line.leftLine &&
                    line.rightLine ? (
                      <span>
                        {highlightWordDifferences(
                          line.leftLine,
                          line.rightLine,
                          "right"
                        )}
                      </span>
                    ) : (
                      <span>{line.rightLine || ""}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto border rounded-md">
          <div className="font-mono text-sm">
            {computeDiff.map((line, idx) => (
              <div key={idx} className={`px-4 py-1 ${getLineColor(line.type)}`}>
                <span className="text-muted-foreground mr-4 inline-block w-12 text-right">
                  {line.leftLineNum || line.rightLineNum}
                </span>
                {line.type === "added" && (
                  <span className="text-green-700 dark:text-green-300">
                    + {line.rightLine}
                  </span>
                )}
                {line.type === "removed" && (
                  <span className="text-red-700 dark:text-red-300">
                    - {line.leftLine}
                  </span>
                )}
                {line.type === "modified" && (
                  <span className="text-yellow-700 dark:text-yellow-300">
                    ~ {line.rightLine}
                  </span>
                )}
                {line.type === "unchanged" && (
                  <span className="text-foreground"> {line.leftLine}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffCompare;
