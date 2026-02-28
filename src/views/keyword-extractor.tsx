import { useState, useMemo } from "react";
import { useGemini, PromptType } from "@/hooks/useGemini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RotateCcw, Download, Loader2, Hash, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface Keyword {
  word: string;
  count: number;
  density: number;
}

const KeywordExtractor = () => {
  const { generateContent, loading, error } = useGemini();
  const [text, setText] = useState("");
  const [minWordLength, setMinWordLength] = useState([3]);
  const [topN, setTopN] = useState([20]);
  const [excludeCommon, setExcludeCommon] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [seoSuggestions, setSeoSuggestions] = useState("");

  // Common stop words to exclude
  const stopWords = useMemo(() => new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "the", "this", "but", "they", "have",
    "had", "what", "when", "where", "who", "which", "why", "how", "or",
    "can", "could", "would", "should", "may", "might", "must", "shall",
    "i", "you", "we", "us", "our", "your", "their", "them", "his", "her",
    "my", "me", "mine", "yours", "theirs", "been", "being", "do", "does",
    "did", "doing", "done", "am", "were", "not", "no", "yes", "if", "then",
    "than", "so", "such", "some", "any", "all", "each", "every", "both",
    "few", "more", "most", "other", "another", "much", "many", "very",
    "too", "also", "just", "only", "own", "same", "into", "through",
    "during", "before", "after", "above", "below", "up", "down", "out",
    "off", "over", "under", "again", "further", "once", "here", "there",
    "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out",
  ]), []);

  // Extract keywords
  const keywords = useMemo((): Keyword[] => {
    if (!text.trim()) return [];

    const processedText = caseSensitive ? text : text.toLowerCase();
    const words = processedText
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(word => word.length >= minWordLength[0]);

    const filteredWords = excludeCommon
      ? words.filter(word => !stopWords.has(word.toLowerCase()))
      : words;

    const wordCount: Record<string, number> = {};
    filteredWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const totalWords = filteredWords.length;
    const keywordList: Keyword[] = Object.entries(wordCount).map(([word, count]) => ({
      word,
      count,
      density: (count / totalWords) * 100,
    }));

    return keywordList
      .sort((a, b) => b.count - a.count)
      .slice(0, topN[0]);
  }, [text, minWordLength, topN, excludeCommon, caseSensitive, stopWords]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalWords = text.trim() ? text.trim().split(/\s+/).length : 0;
    const uniqueWords = new Set(
      text
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter(w => w.length > 0)
    ).size;

    return {
      totalWords,
      uniqueWords,
      uniquePercentage: totalWords > 0 ? (uniqueWords / totalWords) * 100 : 0,
      topKeywords: keywords.slice(0, 5),
    };
  }, [text, keywords]);

  const handleGetSEOSuggestions = async () => {
    if (!text.trim()) {
      toast.error("Please enter some text to analyze");
      return;
    }

    try {
      const topKeywords = keywords.slice(0, 10).map(k => `${k.word} (${k.count}x, ${k.density.toFixed(2)}%)`).join(", ");

      const prompt = `Analyze the following text for SEO keyword optimization:

Text: "${text}"

Current Top Keywords: ${topKeywords}

Please provide:
1. SEO keyword analysis and recommendations
2. Suggested primary keywords (1-3 main keywords)
3. Suggested secondary keywords (5-10 supporting keywords)
4. Long-tail keyword opportunities
5. Related terms and semantic keywords to include
6. Keyword density recommendations
7. Content gaps or topics to expand on
8. Competitor keyword ideas for this topic

Format your response in a clear, actionable way with specific keyword suggestions.`;

      const result = await generateContent({
        prompt,
        type: PromptType.CONVERTER,
      });

      setSeoSuggestions(result);
      toast.success("SEO suggestions generated!");
    } catch (err) {
      toast.error(`Failed to generate suggestions: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleCopy = (content: string, type: string) => {
    if (!content) {
      toast.error(`No ${type} to copy`);
      return;
    }
    navigator.clipboard.writeText(content);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (keywords.length === 0) {
      toast.error("No keywords to download");
      return;
    }

    const keywordList = keywords
      .map(k => `${k.word}\t${k.count}\t${k.density.toFixed(2)}%`)
      .join("\n");

    const content = `KEYWORD EXTRACTION REPORT\n\n` +
      `Total Words: ${stats.totalWords}\n` +
      `Unique Words: ${stats.uniqueWords}\n` +
      `Vocabulary Richness: ${stats.uniquePercentage.toFixed(2)}%\n\n` +
      `TOP KEYWORDS:\n` +
      `Keyword\tCount\tDensity\n` +
      `${keywordList}\n\n` +
      (seoSuggestions ? `SEO SUGGESTIONS:\n${seoSuggestions}\n\n` : '') +
      `ORIGINAL TEXT:\n${text}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keyword-analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleDownloadCSV = () => {
    if (keywords.length === 0) {
      toast.error("No keywords to download");
      return;
    }

    const csv = "Keyword,Count,Density\n" +
      keywords.map(k => `"${k.word}",${k.count},${k.density.toFixed(2)}%`).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keywords.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded!");
  };

  const handleReset = () => {
    setText("");
    setSeoSuggestions("");
    toast.info("Reset complete");
  };

  const loadExample = () => {
    setText(`Artificial intelligence and machine learning are transforming the technology industry. AI algorithms can analyze vast amounts of data to identify patterns and make predictions. Machine learning models improve over time as they process more data. Deep learning, a subset of machine learning, uses neural networks to solve complex problems. Natural language processing enables computers to understand human language. Computer vision allows AI systems to interpret visual information. These AI technologies are being applied across industries including healthcare, finance, and transportation. The future of artificial intelligence holds tremendous potential for innovation and advancement.`);
    setSeoSuggestions("");
  };

  const getDensityColor = (density: number): string => {
    if (density >= 3) return "text-red-600 dark:text-red-400";
    if (density >= 2) return "text-orange-600 dark:text-orange-400";
    if (density >= 1) return "text-yellow-600 dark:text-yellow-400";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Keyword Extractor</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Extract keywords, analyze density, and get AI-powered SEO suggestions
        </p>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">Extraction Settings</CardTitle>
          <CardDescription>Configure keyword extraction parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="min-length">
                Minimum Word Length: {minWordLength[0]} characters
              </Label>
              <Slider
                id="min-length"
                value={minWordLength}
                onValueChange={setMinWordLength}
                min={2}
                max={10}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="top-n">
                Top Keywords to Show: {topN[0]}
              </Label>
              <Slider
                id="top-n"
                value={topN}
                onValueChange={setTopN}
                min={5}
                max={50}
                step={5}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-4 sm:gap-6">
            <div className="flex items-center space-x-2">
              <Switch
                id="exclude-common"
                checked={excludeCommon}
                onCheckedChange={setExcludeCommon}
              />
              <Label htmlFor="exclude-common">Exclude Common Words</Label>
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

      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={handleGetSEOSuggestions} disabled={loading || !text.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Get SEO Suggestions</span>
              <span className="sm:hidden">SEO</span>
            </>
          )}
        </Button>
        <Button onClick={loadExample} variant="outline">
          <span className="hidden sm:inline">Load Example</span>
          <span className="sm:hidden">Example</span>
        </Button>
        <Button onClick={handleReset} variant="outline">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleDownload} variant="outline" disabled={keywords.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Download</span>
        </Button>
        <Button onClick={handleDownloadCSV} variant="outline" disabled={keywords.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Export CSV</span>
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {stats.totalWords > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Words</CardDescription>
              <CardTitle className="text-3xl">{stats.totalWords}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Unique Words</CardDescription>
              <CardTitle className="text-3xl">{stats.uniqueWords}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Vocabulary Richness</CardDescription>
              <CardTitle className="text-3xl">{stats.uniquePercentage.toFixed(1)}%</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Keywords Found</CardDescription>
              <CardTitle className="text-3xl">{keywords.length}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        <div className="flex flex-col">
          <Label className="mb-2">Text to Analyze</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 resize-none font-mono text-sm min-h-[150px] lg:min-h-0"
            placeholder="Enter or paste your text here to extract keywords..."
          />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Label>Extracted Keywords</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(keywords.map(k => k.word).join(", "), "keywords")}
              disabled={keywords.length === 0}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy List
            </Button>
          </div>
          <div className="flex-1 border rounded-md overflow-auto p-4 bg-muted">
            {keywords.length > 0 ? (
              <div className="space-y-2">
                {keywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-background rounded border"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-muted-foreground text-xs w-6">{idx + 1}</span>
                      <span className="font-medium">{keyword.word}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {keyword.count}x
                      </span>
                      <span className={`font-medium ${getDensityColor(keyword.density)}`}>
                        {keyword.density.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Hash className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No keywords extracted yet</p>
                  <p className="text-xs mt-1">Enter text to see keywords</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <Label>SEO Suggestions</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(seoSuggestions, "suggestions")}
              disabled={!seoSuggestions}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            value={seoSuggestions}
            readOnly
            className="flex-1 resize-none text-sm bg-muted min-h-[150px] lg:min-h-0"
            placeholder="Click 'Get SEO Suggestions' to receive AI-powered keyword recommendations and optimization tips..."
          />
        </div>
      </div>
    </div>
  );
};

export default KeywordExtractor;
