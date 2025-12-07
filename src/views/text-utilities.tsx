import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Copy, 
  RotateCcw, 
  Download, 
  Type, 
  Eraser, 
  BarChart3, 
  Search, 
  ArrowUpDown,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type CaseType = "upper" | "lower" | "title" | "sentence" | "camel" | "pascal" | "snake" | "kebab";
type SortOrder = "asc" | "desc" | "numeric-asc" | "numeric-desc";

const TextUtilities = () => {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [activeTab, setActiveTab] = useState("case");

  // Case Converter State
  const [caseType, setCaseType] = useState<CaseType>("upper");

  // Text Cleaner State
  const [removeSpaces, setRemoveSpaces] = useState(true);
  const [removeLineBreaks, setRemoveLineBreaks] = useState(false);
  const [removeSpecialChars, setRemoveSpecialChars] = useState(false);

  // Find & Replace State
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [useRegex, setUseRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);

  // Line Sorter State
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Statistics
  const stats = useMemo(() => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, "").length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split("\n").length : 0;
    const sentences = text.trim() ? text.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0;
    
    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(words / 200);
    
    return {
      chars,
      charsNoSpaces,
      words,
      lines,
      sentences,
      paragraphs,
      readingTime,
    };
  }, [text]);

  // Case Converter Functions
  const convertCase = () => {
    let result = text;

    switch (caseType) {
      case "upper":
        result = text.toUpperCase();
        break;
      case "lower":
        result = text.toLowerCase();
        break;
      case "title":
        result = text.replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
        break;
      case "sentence":
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
      case "camel":
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[A-Z]/, (c) => c.toLowerCase());
        break;
      case "pascal":
        result = text
          .toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
          .replace(/^[a-z]/, (c) => c.toUpperCase());
        break;
      case "snake":
        result = text
          .replace(/\s+/g, "_")
          .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
          .replace(/^_/, "")
          .toLowerCase();
        break;
      case "kebab":
        result = text
          .replace(/\s+/g, "-")
          .replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)
          .replace(/^-/, "")
          .toLowerCase();
        break;
    }

    setOutput(result);
    toast.success("Text converted!");
  };

  // Text Cleaner Functions
  const cleanText = () => {
    let result = text;

    if (removeSpaces) {
      result = result.replace(/\s+/g, " ").trim();
    }

    if (removeLineBreaks) {
      result = result.replace(/\n+/g, " ");
    }

    if (removeSpecialChars) {
      result = result.replace(/[^a-zA-Z0-9\s]/g, "");
    }

    setOutput(result);
    toast.success("Text cleaned!");
  };

  // Find & Replace Functions
  const findAndReplace = () => {
    if (!findText) {
      toast.error("Please enter text to find");
      return;
    }

    try {
      let result = text;
      
      if (useRegex) {
        const flags = caseSensitive ? "g" : "gi";
        const regex = new RegExp(findText, flags);
        result = text.replace(regex, replaceText);
      } else {
        const searchStr = caseSensitive ? findText : findText.toLowerCase();
        const textToSearch = caseSensitive ? text : text.toLowerCase();
        
        if (textToSearch.includes(searchStr)) {
          const regex = new RegExp(
            findText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
            caseSensitive ? "g" : "gi"
          );
          result = text.replace(regex, replaceText);
        }
      }

      setOutput(result);
      const count = (text.match(new RegExp(findText, caseSensitive ? "g" : "gi")) || []).length;
      toast.success(`Replaced ${count} occurrence(s)`);
    } catch {
      toast.error("Invalid regex pattern");
    }
  };

  // Line Sorter Functions
  const sortLines = () => {
    const lines = text.split("\n");
    let sorted: string[];

    switch (sortOrder) {
      case "asc":
        sorted = lines.sort((a, b) => a.localeCompare(b));
        break;
      case "desc":
        sorted = lines.sort((a, b) => b.localeCompare(a));
        break;
      case "numeric-asc":
        sorted = lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numA - numB;
        });
        break;
      case "numeric-desc":
        sorted = lines.sort((a, b) => {
          const numA = parseFloat(a) || 0;
          const numB = parseFloat(b) || 0;
          return numB - numA;
        });
        break;
      default:
        sorted = lines;
    }

    setOutput(sorted.join("\n"));
    toast.success("Lines sorted!");
  };

  // Duplicate Remover Functions
  const removeDuplicates = () => {
    const lines = text.split("\n");
    const unique = [...new Set(lines)];
    const removed = lines.length - unique.length;
    
    setOutput(unique.join("\n"));
    toast.success(`Removed ${removed} duplicate line(s)`);
  };

  // Common Functions
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
    setText("");
    setOutput("");
    toast.info("Reset complete");
  };

  const handleUseOutput = () => {
    setText(output);
    setOutput("");
    toast.info("Output moved to input");
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Text Utilities</h1>
        <p className="text-muted-foreground">
          Powerful text manipulation and analysis tools
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="mb-4">
          <TabsTrigger value="case">
            <Type className="h-4 w-4 mr-2" />
            Case Converter
          </TabsTrigger>
          <TabsTrigger value="clean">
            <Eraser className="h-4 w-4 mr-2" />
            Text Cleaner
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="h-4 w-4 mr-2" />
            Statistics
          </TabsTrigger>
          <TabsTrigger value="find">
            <Search className="h-4 w-4 mr-2" />
            Find & Replace
          </TabsTrigger>
          <TabsTrigger value="sort">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Line Sorter
          </TabsTrigger>
          <TabsTrigger value="duplicate">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Duplicates
          </TabsTrigger>
        </TabsList>

        {/* Case Converter Tab */}
        <TabsContent value="case" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Case Conversion Options</CardTitle>
              <CardDescription>Select the case style to convert to</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={caseType} onValueChange={(v) => setCaseType(v as CaseType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upper">UPPERCASE</SelectItem>
                  <SelectItem value="lower">lowercase</SelectItem>
                  <SelectItem value="title">Title Case</SelectItem>
                  <SelectItem value="sentence">Sentence case</SelectItem>
                  <SelectItem value="camel">camelCase</SelectItem>
                  <SelectItem value="pascal">PascalCase</SelectItem>
                  <SelectItem value="snake">snake_case</SelectItem>
                  <SelectItem value="kebab">kebab-case</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-2 mb-4">
            <Button onClick={convertCase} disabled={!text}>
              Convert
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleUseOutput} variant="outline" disabled={!output}>
              Use Output as Input
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

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Enter your text here..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Converted text will appear here..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Text Cleaner Tab */}
        <TabsContent value="clean" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Cleaning Options</CardTitle>
              <CardDescription>Select what to remove from the text</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="spaces">Remove Extra Spaces</Label>
                <Switch
                  id="spaces"
                  checked={removeSpaces}
                  onCheckedChange={setRemoveSpaces}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="breaks">Remove Line Breaks</Label>
                <Switch
                  id="breaks"
                  checked={removeLineBreaks}
                  onCheckedChange={setRemoveLineBreaks}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="special">Remove Special Characters</Label>
                <Switch
                  id="special"
                  checked={removeSpecialChars}
                  onCheckedChange={setRemoveSpecialChars}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 mb-4">
            <Button onClick={cleanText} disabled={!text}>
              Clean Text
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleUseOutput} variant="outline" disabled={!output}>
              Use Output as Input
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

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Enter your text here..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Cleaned text will appear here..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Characters</CardDescription>
                <CardTitle className="text-3xl">{stats.chars}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Characters (no spaces)</CardDescription>
                <CardTitle className="text-3xl">{stats.charsNoSpaces}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Words</CardDescription>
                <CardTitle className="text-3xl">{stats.words}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Lines</CardDescription>
                <CardTitle className="text-3xl">{stats.lines}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Sentences</CardDescription>
                <CardTitle className="text-3xl">{stats.sentences}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Paragraphs</CardDescription>
                <CardTitle className="text-3xl">{stats.paragraphs}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Reading Time</CardDescription>
                <CardTitle className="text-3xl">{stats.readingTime} min</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Avg Word Length</CardDescription>
                <CardTitle className="text-3xl">
                  {stats.words > 0 ? (stats.charsNoSpaces / stats.words).toFixed(1) : 0}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="flex gap-2 mb-4">
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="flex-1">
            <Label className="mb-2">Input Text</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="h-full resize-none font-mono text-sm"
              placeholder="Enter your text to see statistics..."
            />
          </div>
        </TabsContent>

        {/* Find & Replace Tab */}
        <TabsContent value="find" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Find & Replace Options</CardTitle>
              <CardDescription>Search and replace text with optional regex support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="find">Find</Label>
                  <Input
                    id="find"
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Text to find..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="replace">Replace with</Label>
                  <Input
                    id="replace"
                    value={replaceText}
                    onChange={(e) => setReplaceText(e.target.value)}
                    placeholder="Replacement text..."
                  />
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="regex"
                    checked={useRegex}
                    onCheckedChange={setUseRegex}
                  />
                  <Label htmlFor="regex">Use Regex</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="case-sensitive"
                    checked={caseSensitive}
                    onCheckedChange={setCaseSensitive}
                  />
                  <Label htmlFor="case-sensitive">Case Sensitive</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2 mb-4">
            <Button onClick={findAndReplace} disabled={!text || !findText}>
              Replace All
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleUseOutput} variant="outline" disabled={!output}>
              Use Output as Input
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

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Enter your text here..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Result will appear here..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Line Sorter Tab */}
        <TabsContent value="sort" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Sort Options</CardTitle>
              <CardDescription>Choose how to sort the lines</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Alphabetically (A-Z)</SelectItem>
                  <SelectItem value="desc">Alphabetically (Z-A)</SelectItem>
                  <SelectItem value="numeric-asc">Numerically (0-9)</SelectItem>
                  <SelectItem value="numeric-desc">Numerically (9-0)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex gap-2 mb-4">
            <Button onClick={sortLines} disabled={!text}>
              Sort Lines
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleUseOutput} variant="outline" disabled={!output}>
              Use Output as Input
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

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Enter lines to sort..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Sorted lines will appear here..."
              />
            </div>
          </div>
        </TabsContent>

        {/* Remove Duplicates Tab */}
        <TabsContent value="duplicate" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Remove Duplicate Lines</CardTitle>
              <CardDescription>
                Remove duplicate lines while preserving the order of first occurrence
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="flex gap-2 mb-4">
            <Button onClick={removeDuplicates} disabled={!text}>
              Remove Duplicates
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleUseOutput} variant="outline" disabled={!output}>
              Use Output as Input
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

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Text</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Enter text with duplicate lines..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Output</Label>
              <Textarea
                value={output}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Unique lines will appear here..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextUtilities;
