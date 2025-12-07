import { useState, useMemo } from "react";
import { useGemini, PromptType } from "@/hooks/useGemini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RotateCcw, Download, Loader2, BookOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface ReadabilityScores {
  fleschKincaid: number;
  fleschKincaidGrade: number;
  smogIndex: number;
  colemanLiau: number;
  automatedReadability: number;
  avgSentenceLength: number;
  avgWordLength: number;
  complexWords: number;
  complexWordsPercent: number;
}

const ReadabilityAnalyzer = () => {
  const { generateContent, loading, error } = useGemini();
  const [text, setText] = useState("");
  const [suggestions, setSuggestions] = useState("");

  // Calculate syllables in a word (approximation)
  const countSyllables = (word: string): number => {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (word.length <= 3) return 1;
    
    const vowels = "aeiouy";
    let syllableCount = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        syllableCount++;
      }
      previousWasVowel = isVowel;
    }

    // Adjust for silent 'e'
    if (word.endsWith("e")) {
      syllableCount--;
    }

    // Ensure at least 1 syllable
    return Math.max(1, syllableCount);
  };

  // Check if word is complex (3+ syllables)
  const isComplexWord = (word: string): boolean => {
    return countSyllables(word) >= 3;
  };

  // Calculate readability scores
  const scores = useMemo((): ReadabilityScores | null => {
    if (!text.trim()) return null;

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.trim().split(/\s+/);
    const characters = text.replace(/\s/g, "").length;

    if (sentences.length === 0 || words.length === 0) return null;

    const sentenceCount = sentences.length;
    const wordCount = words.length;
    const syllableCount = words.reduce((sum, word) => sum + countSyllables(word), 0);
    const complexWordCount = words.filter(isComplexWord).length;

    // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
    const fleschKincaid = 206.835 - 
      1.015 * (wordCount / sentenceCount) - 
      84.6 * (syllableCount / wordCount);

    // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
    const fleschKincaidGrade = 
      0.39 * (wordCount / sentenceCount) + 
      11.8 * (syllableCount / wordCount) - 
      15.59;

    // SMOG Index: 1.0430 * sqrt(polysyllables * (30/sentences)) + 3.1291
    const smogIndex = 
      1.0430 * Math.sqrt(complexWordCount * (30 / sentenceCount)) + 3.1291;

    // Coleman-Liau Index: 0.0588L - 0.296S - 15.8
    // L = average number of letters per 100 words
    // S = average number of sentences per 100 words
    const L = (characters / wordCount) * 100;
    const S = (sentenceCount / wordCount) * 100;
    const colemanLiau = 0.0588 * L - 0.296 * S - 15.8;

    // Automated Readability Index: 4.71(characters/words) + 0.5(words/sentences) - 21.43
    const automatedReadability = 
      4.71 * (characters / wordCount) + 
      0.5 * (wordCount / sentenceCount) - 
      21.43;

    return {
      fleschKincaid: Math.max(0, Math.min(100, fleschKincaid)),
      fleschKincaidGrade: Math.max(0, fleschKincaidGrade),
      smogIndex: Math.max(0, smogIndex),
      colemanLiau: Math.max(0, colemanLiau),
      automatedReadability: Math.max(0, automatedReadability),
      avgSentenceLength: wordCount / sentenceCount,
      avgWordLength: characters / wordCount,
      complexWords: complexWordCount,
      complexWordsPercent: (complexWordCount / wordCount) * 100,
    };
  }, [text]);

  // Get readability interpretation
  const getFleschInterpretation = (score: number): { level: string; color: string; description: string } => {
    if (score >= 90) return { 
      level: "Very Easy", 
      color: "text-green-600 dark:text-green-400",
      description: "Easily understood by 11-year-olds"
    };
    if (score >= 80) return { 
      level: "Easy", 
      color: "text-green-500 dark:text-green-500",
      description: "Conversational English for consumers"
    };
    if (score >= 70) return { 
      level: "Fairly Easy", 
      color: "text-blue-600 dark:text-blue-400",
      description: "Plain English, easily understood"
    };
    if (score >= 60) return { 
      level: "Standard", 
      color: "text-blue-500 dark:text-blue-500",
      description: "Easily understood by 13-15 year olds"
    };
    if (score >= 50) return { 
      level: "Fairly Difficult", 
      color: "text-yellow-600 dark:text-yellow-400",
      description: "Fairly difficult to read"
    };
    if (score >= 30) return { 
      level: "Difficult", 
      color: "text-orange-600 dark:text-orange-400",
      description: "Difficult to read, college level"
    };
    return { 
      level: "Very Difficult", 
      color: "text-red-600 dark:text-red-400",
      description: "Very difficult, college graduate level"
    };
  };

  const getGradeLevel = (grade: number): string => {
    if (grade <= 6) return "Elementary School";
    if (grade <= 8) return "Middle School";
    if (grade <= 12) return "High School";
    if (grade <= 16) return "College";
    return "Graduate School";
  };

  const handleGetSuggestions = async () => {
    if (!text.trim() || !scores) {
      toast.error("Please enter some text to analyze");
      return;
    }

    try {
      const fleschInfo = getFleschInterpretation(scores.fleschKincaid);
      
      const prompt = `Analyze the following text for readability and provide specific suggestions for improvement:

Text: "${text}"

Current Readability Metrics:
- Flesch Reading Ease: ${scores.fleschKincaid.toFixed(1)} (${fleschInfo.level})
- Grade Level: ${scores.fleschKincaidGrade.toFixed(1)} (${getGradeLevel(scores.fleschKincaidGrade)})
- Average Sentence Length: ${scores.avgSentenceLength.toFixed(1)} words
- Complex Words: ${scores.complexWords} (${scores.complexWordsPercent.toFixed(1)}%)

Please provide:
1. Overall assessment of the text's readability
2. Specific sentences or phrases that are too complex
3. Concrete suggestions to improve clarity and readability
4. Recommended simpler alternatives for complex words
5. Tips for better sentence structure

Format your response in a clear, actionable way.`;

      const result = await generateContent({
        prompt,
        type: PromptType.CONVERTER,
      });

      setSuggestions(result);
      toast.success("Suggestions generated!");
    } catch (err) {
      toast.error(`Failed to generate suggestions: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleCopy = () => {
    if (!suggestions) {
      toast.error("No suggestions to copy");
      return;
    }
    navigator.clipboard.writeText(suggestions);
    toast.success("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!suggestions) {
      toast.error("No suggestions to download");
      return;
    }

    const content = `READABILITY ANALYSIS REPORT\n\n${
      scores ? `SCORES:\n` +
      `- Flesch Reading Ease: ${scores.fleschKincaid.toFixed(1)}\n` +
      `- Grade Level: ${scores.fleschKincaidGrade.toFixed(1)}\n` +
      `- SMOG Index: ${scores.smogIndex.toFixed(1)}\n` +
      `- Coleman-Liau: ${scores.colemanLiau.toFixed(1)}\n\n` : ''
    }SUGGESTIONS:\n${suggestions}\n\nORIGINAL TEXT:\n${text}`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "readability-analysis.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleReset = () => {
    setText("");
    setSuggestions("");
    toast.info("Reset complete");
  };

  const loadExample = () => {
    setText(`The implementation of sophisticated methodologies necessitates the utilization of comprehensive analytical frameworks. Consequently, organizational stakeholders must endeavor to facilitate synergistic collaborations that optimize operational efficiencies. Furthermore, the integration of cutting-edge technological solutions requires meticulous consideration of multifaceted variables and interdependencies.`);
    setSuggestions("");
  };

  const fleschInfo = scores ? getFleschInterpretation(scores.fleschKincaid) : null;

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Readability Analyzer</h1>
        <p className="text-muted-foreground">
          Analyze text readability with multiple scoring algorithms and get AI-powered improvement suggestions
        </p>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleGetSuggestions} disabled={loading || !text.trim()}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <BookOpen className="h-4 w-4 mr-2" />
              Get AI Suggestions
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
        <Button onClick={handleCopy} variant="outline" disabled={!suggestions}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </Button>
        <Button onClick={handleDownload} variant="outline" disabled={!suggestions}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {scores && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <Card>
            <CardHeader>
              <CardDescription>Flesch Reading Ease</CardDescription>
              <CardTitle className={`text-3xl ${fleschInfo?.color}`}>
                {scores.fleschKincaid.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={scores.fleschKincaid} className="mb-2" />
              <p className="text-sm font-medium">{fleschInfo?.level}</p>
              <p className="text-xs text-muted-foreground">{fleschInfo?.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Grade Level</CardDescription>
              <CardTitle className="text-3xl">
                {scores.fleschKincaidGrade.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{getGradeLevel(scores.fleschKincaidGrade)}</p>
              <p className="text-xs text-muted-foreground">
                Flesch-Kincaid Grade Level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>SMOG Index</CardDescription>
              <CardTitle className="text-3xl">
                {scores.smogIndex.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {getGradeLevel(scores.smogIndex)}
              </p>
              <p className="text-xs text-muted-foreground">
                Simple Measure of Gobbledygook
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Coleman-Liau Index</CardDescription>
              <CardTitle className="text-3xl">
                {scores.colemanLiau.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {getGradeLevel(scores.colemanLiau)}
              </p>
              <p className="text-xs text-muted-foreground">
                Based on characters per word
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Automated Readability</CardDescription>
              <CardTitle className="text-3xl">
                {scores.automatedReadability.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {getGradeLevel(scores.automatedReadability)}
              </p>
              <p className="text-xs text-muted-foreground">
                ARI Score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Text Complexity</CardDescription>
              <CardTitle className="text-3xl">
                {scores.complexWordsPercent.toFixed(1)}%
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">
                {scores.complexWords} complex words
              </p>
              <p className="text-xs text-muted-foreground">
                Words with 3+ syllables
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Avg Sentence Length</CardDescription>
              <CardTitle className="text-3xl">
                {scores.avgSentenceLength.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Words per sentence</p>
              <p className="text-xs text-muted-foreground">
                Ideal: 15-20 words
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Avg Word Length</CardDescription>
              <CardTitle className="text-3xl">
                {scores.avgWordLength.toFixed(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">Characters per word</p>
              <p className="text-xs text-muted-foreground">
                Shorter words = easier reading
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col">
          <Label className="mb-2">Text to Analyze</Label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 resize-none font-mono text-sm"
            placeholder="Enter or paste your text here to analyze its readability..."
          />
        </div>

        <div className="flex flex-col">
          <Label className="mb-2">AI Suggestions</Label>
          <Textarea
            value={suggestions}
            readOnly
            className="flex-1 resize-none text-sm bg-muted"
            placeholder="Click 'Get AI Suggestions' to receive personalized recommendations for improving readability..."
          />
        </div>
      </div>
    </div>
  );
};

export default ReadabilityAnalyzer;
