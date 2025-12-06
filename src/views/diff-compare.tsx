import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, GitCompare, RotateCcw, Download, Upload, ArrowLeftRight } from "lucide-react";
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
      leftLines = leftLines.map(line => line.trim());
      rightLines = rightLines.map(line => line.trim());
    }

    if (ignoreCase) {
      leftLines = leftLines.map(line => line.toLowerCase());
      rightLines = rightLines.map(line => line.toLowerCase());
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
    const added = computeDiff.filter(d => d.type === "added").length;
    const removed = computeDiff.filter(d => d.type === "removed").length;
    const modified = computeDiff.filter(d => d.type === "modified").length;
    const unchanged = computeDiff.filter(d => d.type === "unchanged").length;

    return { added, removed, modified, unchanged, total: computeDiff.length };
  }, [computeDiff]);

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
      .map(line => {
        if (line.type === "added") return `+ ${line.rightLine}`;
        if (line.type === "removed") return `- ${line.leftLine}`;
        if (line.type === "modified") return `~ ${line.leftLine} → ${line.rightLine}`;
        return `  ${line.leftLine}`;
      })
      .join("\n");

    navigator.clipboard.writeText(diffText);
    toast.success("Diff copied to clipboard!");
  };

  const handleDownloadDiff = () => {
    const diffText = computeDiff
      .map(line => {
        if (line.type === "added") return `+ ${line.rightLine}`;
        if (line.type === "removed") return `- ${line.leftLine}`;
        if (line.type === "modified") return `~ ${line.leftLine} → ${line.rightLine}`;
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

  const handleFileUpload = (side: "left" | "right") => (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Diff & Compare</h1>
        <p className="text-muted-foreground">
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

      <div className="flex items-center justify-between mb-4">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="side-by-side">
              <GitCompare className="h-4 w-4 mr-2" />
              Side by Side
            </TabsTrigger>
            <TabsTrigger value="unified">
              Unified View
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <Button onClick={loadExample} variant="outline" size="sm">
            Load Example
          </Button>
          <Button onClick={handleSwap} variant="outline" size="sm">
            <ArrowLeftRight className="h-4 w-4 mr-2" />
            Swap
          </Button>
          <Button onClick={handleReset} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleCopyDiff} variant="outline" size="sm" disabled={!leftText && !rightText}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Diff
          </Button>
          <Button onClick={handleDownloadDiff} variant="outline" size="sm" disabled={!leftText && !rightText}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {(leftText || rightText) && (
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="flex gap-6 text-sm">
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

      {viewMode === "side-by-side" ? (
        <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
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
            <Textarea
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
              className="flex-1 resize-none font-mono text-sm"
              placeholder="Enter or paste original text..."
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
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
            <Textarea
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
              className="flex-1 resize-none font-mono text-sm"
              placeholder="Enter or paste modified text..."
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-auto border rounded-md">
          <div className="font-mono text-sm">
            {computeDiff.map((line, idx) => (
              <div
                key={idx}
                className={`px-4 py-1 ${getLineColor(line.type)}`}
              >
                <span className="text-muted-foreground mr-4 inline-block w-12 text-right">
                  {line.leftLineNum || line.rightLineNum}
                </span>
                {line.type === "added" && (
                  <span className="text-green-700 dark:text-green-300">+ {line.rightLine}</span>
                )}
                {line.type === "removed" && (
                  <span className="text-red-700 dark:text-red-300">- {line.leftLine}</span>
                )}
                {line.type === "modified" && (
                  <span className="text-yellow-700 dark:text-yellow-300">~ {line.rightLine}</span>
                )}
                {line.type === "unchanged" && (
                  <span className="text-foreground">  {line.leftLine}</span>
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
