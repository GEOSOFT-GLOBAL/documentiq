import { useState } from "react";
import { useGemini, PromptType } from "@/hooks/useGemini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, RotateCcw, Download, Loader2, BookOpen, Globe, FileText, Video, ArrowRightLeft, Plus, Trash2, AlertCircle, Wand2 } from "lucide-react";
import { toast } from "sonner";

type SourceType = "book" | "website" | "journal" | "video";
type CitationStyle = "apa" | "mla" | "chicago" | "harvard" | "ieee";

interface Citation {
  id: string;
  sourceType: SourceType;
  authors: string;
  title: string;
  year: string;
  publisher?: string;
  url?: string;
  accessDate?: string;
  journalName?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  websiteName?: string;
  channelName?: string;
  videoUrl?: string;
  formatted?: Record<CitationStyle, string>;
}

// Manual citation formatting functions
const formatAuthorAPA = (authors: string): string => {
  if (!authors) return "";
  const authorList = authors.split(/[,&]/).map(a => a.trim()).filter(Boolean);
  if (authorList.length === 1) return authorList[0];
  if (authorList.length === 2) return `${authorList[0]} & ${authorList[1]}`;
  return `${authorList.slice(0, -1).join(", ")}, & ${authorList[authorList.length - 1]}`;
};

const formatAuthorMLA = (authors: string): string => {
  if (!authors) return "";
  const authorList = authors.split(/[,&]/).map(a => a.trim()).filter(Boolean);
  if (authorList.length === 1) return authorList[0];
  if (authorList.length === 2) return `${authorList[0]}, and ${authorList[1]}`;
  return `${authorList[0]}, et al.`;
};


const formatManualCitation = (
  citation: Partial<Citation>,
  sourceType: SourceType,
  style: CitationStyle
): string => {
  const { authors = "", title = "", year = "", publisher = "", url = "", accessDate = "", journalName = "", volume = "", issue = "", pages = "", doi = "", websiteName = "", channelName = "", videoUrl = "" } = citation;

  switch (style) {
    case "apa":
      switch (sourceType) {
        case "book":
          return `${formatAuthorAPA(authors)}${year ? ` (${year})` : ""}. *${title}*${publisher ? `. ${publisher}` : ""}.`;
        case "website":
          return `${formatAuthorAPA(authors)}${year ? ` (${year})` : ""}. ${title}. ${websiteName || ""}. ${url ? `Retrieved ${accessDate || "n.d."} from ${url}` : ""}`;
        case "journal":
          return `${formatAuthorAPA(authors)}${year ? ` (${year})` : ""}. ${title}. *${journalName}*${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, ${pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
        case "video":
          return `${channelName || authors}${year ? ` (${year})` : ""}. *${title}* [Video]. YouTube. ${videoUrl || ""}`;
      }
      break;

    case "mla":
      switch (sourceType) {
        case "book":
          return `${formatAuthorMLA(authors)}. *${title}*. ${publisher || ""}${year ? `, ${year}` : ""}.`;
        case "website":
          return `${formatAuthorMLA(authors)}. "${title}." *${websiteName || ""}*${year ? `, ${year}` : ""}${url ? `, ${url}` : ""}. Accessed ${accessDate || "n.d."}.`;
        case "journal":
          return `${formatAuthorMLA(authors)}. "${title}." *${journalName}*${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${year ? `, ${year}` : ""}${pages ? `, pp. ${pages}` : ""}.${doi ? ` DOI: ${doi}` : ""}`;
        case "video":
          return `"${title}." YouTube, uploaded by ${channelName || authors}${year ? `, ${year}` : ""}, ${videoUrl || ""}.`;
      }
      break;

    case "chicago":
      switch (sourceType) {
        case "book":
          return `${formatAuthorMLA(authors)}. *${title}*. ${publisher || ""}${year ? `, ${year}` : ""}.`;
        case "website":
          return `${formatAuthorMLA(authors)}. "${title}." ${websiteName || ""}${year ? `. ${year}` : ""}. ${url || ""}`;
        case "journal":
          return `${formatAuthorMLA(authors)}. "${title}." *${journalName}* ${volume || ""}${issue ? `, no. ${issue}` : ""} (${year || "n.d."})${pages ? `: ${pages}` : ""}.${doi ? ` https://doi.org/${doi}` : ""}`;
        case "video":
          return `${channelName || authors}. "${title}." YouTube video${year ? `, ${year}` : ""}. ${videoUrl || ""}`;
      }
      break;

    case "harvard":
      switch (sourceType) {
        case "book":
          return `${formatAuthorAPA(authors)} (${year || "n.d."}) *${title}*. ${publisher || ""}.`;
        case "website":
          return `${formatAuthorAPA(authors)} (${year || "n.d."}) ${title}. [online] ${websiteName || ""}. Available at: ${url || ""} [Accessed ${accessDate || "n.d."}].`;
        case "journal":
          return `${formatAuthorAPA(authors)} (${year || "n.d."}) '${title}', *${journalName}*${volume ? `, ${volume}` : ""}${issue ? `(${issue})` : ""}${pages ? `, pp. ${pages}` : ""}.${doi ? ` doi: ${doi}` : ""}`;
        case "video":
          return `${channelName || authors} (${year || "n.d."}) *${title}*. [video] Available at: ${videoUrl || ""}`;
      }
      break;

    case "ieee":
      switch (sourceType) {
        case "book":
          return `${authors}, *${title}*. ${publisher || ""}${year ? `, ${year}` : ""}.`;
        case "website":
          return `${authors}, "${title}," ${websiteName || ""}${year ? `, ${year}` : ""}. [Online]. Available: ${url || ""}. [Accessed: ${accessDate || "n.d."}].`;
        case "journal":
          return `${authors}, "${title}," *${journalName}*${volume ? `, vol. ${volume}` : ""}${issue ? `, no. ${issue}` : ""}${pages ? `, pp. ${pages}` : ""}${year ? `, ${year}` : ""}.${doi ? ` doi: ${doi}` : ""}`;
        case "video":
          return `${channelName || authors}, "${title}," YouTube${year ? `, ${year}` : ""}. [Online Video]. Available: ${videoUrl || ""}`;
      }
      break;
  }
  return "";
};


const CitationGenerator = () => {
  const { generateContent, loading, error } = useGemini();
  const [activeTab, setActiveTab] = useState<"create" | "convert">("create");
  const [sourceType, setSourceType] = useState<SourceType>("book");
  const [citationStyle, setCitationStyle] = useState<CitationStyle>("apa");
  const [citations, setCitations] = useState<Citation[]>([]);
  const [currentCitation, setCurrentCitation] = useState<Partial<Citation>>({});
  const [useAI, setUseAI] = useState(false);

  // Convert tab state
  const [inputCitations, setInputCitations] = useState("");
  const [sourceStyle, setSourceStyle] = useState<CitationStyle>("apa");
  const [targetStyle, setTargetStyle] = useState<CitationStyle>("mla");
  const [convertedCitations, setConvertedCitations] = useState("");

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleInputChange = (field: keyof Citation, value: string) => {
    setCurrentCitation((prev) => ({ ...prev, [field]: value }));
  };

  const getStyleName = (style: CitationStyle): string => {
    const names: Record<CitationStyle, string> = {
      apa: "APA 7th Edition",
      mla: "MLA 9th Edition",
      chicago: "Chicago 17th Edition",
      harvard: "Harvard",
      ieee: "IEEE",
    };
    return names[style];
  };

  const buildSourceInfo = (): string => {
    const parts: string[] = [];
    if (currentCitation.authors) parts.push(`Author(s): ${currentCitation.authors}`);
    if (currentCitation.title) parts.push(`Title: ${currentCitation.title}`);
    if (currentCitation.year) parts.push(`Year: ${currentCitation.year}`);
    switch (sourceType) {
      case "book":
        if (currentCitation.publisher) parts.push(`Publisher: ${currentCitation.publisher}`);
        if (currentCitation.pages) parts.push(`Pages: ${currentCitation.pages}`);
        break;
      case "website":
        if (currentCitation.websiteName) parts.push(`Website Name: ${currentCitation.websiteName}`);
        if (currentCitation.url) parts.push(`URL: ${currentCitation.url}`);
        if (currentCitation.accessDate) parts.push(`Access Date: ${currentCitation.accessDate}`);
        break;
      case "journal":
        if (currentCitation.journalName) parts.push(`Journal: ${currentCitation.journalName}`);
        if (currentCitation.volume) parts.push(`Volume: ${currentCitation.volume}`);
        if (currentCitation.issue) parts.push(`Issue: ${currentCitation.issue}`);
        if (currentCitation.pages) parts.push(`Pages: ${currentCitation.pages}`);
        if (currentCitation.doi) parts.push(`DOI: ${currentCitation.doi}`);
        break;
      case "video":
        if (currentCitation.channelName) parts.push(`Channel: ${currentCitation.channelName}`);
        if (currentCitation.videoUrl) parts.push(`URL: ${currentCitation.videoUrl}`);
        break;
    }
    return parts.join("\n");
  };

  const handleGenerateCitation = async () => {
    if (!currentCitation.title || !currentCitation.authors) {
      toast.error("Please fill in at least the title and author(s)");
      return;
    }

    let formattedCitation = "";

    if (useAI) {
      try {
        const sourceInfo = buildSourceInfo();
        const prompt = `Generate a citation in ${getStyleName(citationStyle)} format for the following source:\n\nSource Type: ${sourceType}\n${sourceInfo}\n\nPlease provide ONLY the formatted citation, nothing else. Follow ${getStyleName(citationStyle)} guidelines exactly.`;
        formattedCitation = (await generateContent({ prompt, type: PromptType.CONVERTER })).trim();
      } catch (err) {
        toast.error(`Failed to generate citation: ${err instanceof Error ? err.message : "Unknown error"}`);
        return;
      }
    } else {
      formattedCitation = formatManualCitation(currentCitation, sourceType, citationStyle);
    }

    const newCitation: Citation = {
      id: generateId(),
      sourceType,
      ...currentCitation,
      authors: currentCitation.authors || "",
      title: currentCitation.title || "",
      year: currentCitation.year || "",
      formatted: { ...({} as Record<CitationStyle, string>), [citationStyle]: formattedCitation },
    };

    setCitations((prev) => [...prev, newCitation]);
    setCurrentCitation({});
    toast.success("Citation generated!");
  };


  const handleConvertCitations = async () => {
    if (!inputCitations.trim()) {
      toast.error("Please enter citations to convert");
      return;
    }
    if (sourceStyle === targetStyle) {
      toast.error("Source and target styles must be different");
      return;
    }
    try {
      const prompt = `Convert the following citations from ${getStyleName(sourceStyle)} format to ${getStyleName(targetStyle)} format.\n\nInput Citations (${getStyleName(sourceStyle)}):\n${inputCitations}\n\nPlease convert each citation to ${getStyleName(targetStyle)} format. Maintain the same order. Output ONLY the converted citations, one per line, with no additional text or explanations.`;
      const result = await generateContent({ prompt, type: PromptType.CONVERTER });
      setConvertedCitations(result.trim());
      toast.success("Citations converted!");
    } catch (err) {
      toast.error(`Failed to convert citations: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleCopy = (text: string) => {
    if (!text) { toast.error("Nothing to copy"); return; }
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleCopyAllCitations = () => {
    if (citations.length === 0) { toast.error("No citations to copy"); return; }
    const allCitations = citations.map((c) => c.formatted?.[citationStyle] || "").filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(allCitations);
    toast.success("All citations copied!");
  };

  const handleDownload = () => {
    if (citations.length === 0) { toast.error("No citations to download"); return; }
    const content = `BIBLIOGRAPHY (${getStyleName(citationStyle)})\n\n` + citations.map((c) => c.formatted?.[citationStyle] || "").filter(Boolean).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bibliography-${citationStyle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handleDeleteCitation = (id: string) => {
    setCitations((prev) => prev.filter((c) => c.id !== id));
    toast.info("Citation removed");
  };

  const handleReset = () => { setCurrentCitation({}); toast.info("Form cleared"); };
  const handleResetAll = () => { setCitations([]); setCurrentCitation({}); setInputCitations(""); setConvertedCitations(""); toast.info("All cleared"); };

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case "book": return <BookOpen className="h-4 w-4" />;
      case "website": return <Globe className="h-4 w-4" />;
      case "journal": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
    }
  };


  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Citation Generator</h1>
        <p className="text-muted-foreground">Create citations in multiple formats or convert between citation styles</p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "create" | "convert")}>
        <TabsList className="mb-4">
          <TabsTrigger value="create"><Plus className="h-4 w-4 mr-2" />Create Citations</TabsTrigger>
          <TabsTrigger value="convert"><ArrowRightLeft className="h-4 w-4 mr-2" />Convert Format</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Information</CardTitle>
                <CardDescription>Enter details about your source</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-4 w-4" />
                    <Label htmlFor="use-ai">Use AI for formatting</Label>
                  </div>
                  <Switch id="use-ai" checked={useAI} onCheckedChange={setUseAI} />
                </div>
                {!useAI && <p className="text-xs text-muted-foreground">Manual mode: Uses built-in templates (faster, no API needed)</p>}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Source Type</Label>
                    <Select value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book"><div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Book</div></SelectItem>
                        <SelectItem value="website"><div className="flex items-center gap-2"><Globe className="h-4 w-4" /> Website</div></SelectItem>
                        <SelectItem value="journal"><div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Journal Article</div></SelectItem>
                        <SelectItem value="video"><div className="flex items-center gap-2"><Video className="h-4 w-4" /> Video</div></SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Citation Style</Label>
                    <Select value={citationStyle} onValueChange={(v) => setCitationStyle(v as CitationStyle)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apa">APA 7th Edition</SelectItem>
                        <SelectItem value="mla">MLA 9th Edition</SelectItem>
                        <SelectItem value="chicago">Chicago 17th Edition</SelectItem>
                        <SelectItem value="harvard">Harvard</SelectItem>
                        <SelectItem value="ieee">IEEE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authors">Author(s) *</Label>
                  <Input id="authors" value={currentCitation.authors || ""} onChange={(e) => handleInputChange("authors", e.target.value)} placeholder="e.g., Smith, John or Smith, J. & Doe, J." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={currentCitation.title || ""} onChange={(e) => handleInputChange("title", e.target.value)} placeholder="Title of the work" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" value={currentCitation.year || ""} onChange={(e) => handleInputChange("year", e.target.value)} placeholder="e.g., 2023" />
                </div>

                {sourceType === "book" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="publisher">Publisher</Label>
                      <Input id="publisher" value={currentCitation.publisher || ""} onChange={(e) => handleInputChange("publisher", e.target.value)} placeholder="Publisher name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pages">Pages</Label>
                      <Input id="pages" value={currentCitation.pages || ""} onChange={(e) => handleInputChange("pages", e.target.value)} placeholder="e.g., 45-67" />
                    </div>
                  </>
                )}

                {sourceType === "website" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="websiteName">Website Name</Label>
                      <Input id="websiteName" value={currentCitation.websiteName || ""} onChange={(e) => handleInputChange("websiteName", e.target.value)} placeholder="e.g., BBC News" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="url">URL</Label>
                      <Input id="url" value={currentCitation.url || ""} onChange={(e) => handleInputChange("url", e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accessDate">Access Date</Label>
                      <Input id="accessDate" value={currentCitation.accessDate || ""} onChange={(e) => handleInputChange("accessDate", e.target.value)} placeholder="e.g., December 7, 2025" />
                    </div>
                  </>
                )}

                {sourceType === "journal" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="journalName">Journal Name</Label>
                      <Input id="journalName" value={currentCitation.journalName || ""} onChange={(e) => handleInputChange("journalName", e.target.value)} placeholder="Journal name" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="volume">Volume</Label>
                        <Input id="volume" value={currentCitation.volume || ""} onChange={(e) => handleInputChange("volume", e.target.value)} placeholder="Vol." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="issue">Issue</Label>
                        <Input id="issue" value={currentCitation.issue || ""} onChange={(e) => handleInputChange("issue", e.target.value)} placeholder="Issue" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pages">Pages</Label>
                        <Input id="pages" value={currentCitation.pages || ""} onChange={(e) => handleInputChange("pages", e.target.value)} placeholder="pp." />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doi">DOI</Label>
                      <Input id="doi" value={currentCitation.doi || ""} onChange={(e) => handleInputChange("doi", e.target.value)} placeholder="e.g., 10.1000/xyz123" />
                    </div>
                  </>
                )}

                {sourceType === "video" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="channelName">Channel Name</Label>
                      <Input id="channelName" value={currentCitation.channelName || ""} onChange={(e) => handleInputChange("channelName", e.target.value)} placeholder="YouTube channel name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input id="videoUrl" value={currentCitation.videoUrl || ""} onChange={(e) => handleInputChange("videoUrl", e.target.value)} placeholder="https://youtube.com/..." />
                    </div>
                  </>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={handleGenerateCitation} disabled={loading && useAI}>
                    {loading && useAI ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Generating...</>) : (<><Plus className="h-4 w-4 mr-2" />Generate Citation</>)}
                  </Button>
                  <Button onClick={handleReset} variant="outline"><RotateCcw className="h-4 w-4 mr-2" />Clear Form</Button>
                </div>
              </CardContent>
            </Card>


            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Generated Citations</CardTitle>
                    <CardDescription>{citations.length} citation(s) in {getStyleName(citationStyle)}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleCopyAllCitations} disabled={citations.length === 0}><Copy className="h-4 w-4 mr-2" />Copy All</Button>
                    <Button variant="outline" size="sm" onClick={handleDownload} disabled={citations.length === 0}><Download className="h-4 w-4 mr-2" />Download</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <p className="text-destructive text-sm">{error}</p>
                  </div>
                )}
                <div className="space-y-3 max-h-[400px] overflow-auto">
                  {citations.length > 0 ? (
                    citations.map((citation) => (
                      <div key={citation.id} className="p-3 border rounded-md bg-muted/50">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1">
                            {getSourceIcon(citation.sourceType)}
                            <p className="text-sm flex-1">{citation.formatted?.[citationStyle] || "Generating..."}</p>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleCopy(citation.formatted?.[citationStyle] || "")}><Copy className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCitation(citation.id)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No citations yet</p>
                      <p className="text-xs mt-1">Fill in the form and click "Generate Citation"</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="convert" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Convert Citation Format</CardTitle>
              <CardDescription>Paste citations in one format and convert them to another (uses AI)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <Label>Source Format</Label>
                  <Select value={sourceStyle} onValueChange={(v) => setSourceStyle(v as CitationStyle)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apa">APA 7th Edition</SelectItem>
                      <SelectItem value="mla">MLA 9th Edition</SelectItem>
                      <SelectItem value="chicago">Chicago 17th Edition</SelectItem>
                      <SelectItem value="harvard">Harvard</SelectItem>
                      <SelectItem value="ieee">IEEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-center"><ArrowRightLeft className="h-6 w-6 text-muted-foreground" /></div>
                <div className="space-y-2">
                  <Label>Target Format</Label>
                  <Select value={targetStyle} onValueChange={(v) => setTargetStyle(v as CitationStyle)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apa">APA 7th Edition</SelectItem>
                      <SelectItem value="mla">MLA 9th Edition</SelectItem>
                      <SelectItem value="chicago">Chicago 17th Edition</SelectItem>
                      <SelectItem value="harvard">Harvard</SelectItem>
                      <SelectItem value="ieee">IEEE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleConvertCitations} disabled={loading || !inputCitations.trim()}>
                  {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Converting...</>) : (<><ArrowRightLeft className="h-4 w-4 mr-2" />Convert Citations</>)}
                </Button>
                <Button onClick={handleResetAll} variant="outline"><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
                <Button onClick={() => handleCopy(convertedCitations)} variant="outline" disabled={!convertedCitations}><Copy className="h-4 w-4 mr-2" />Copy Result</Button>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">Input Citations ({getStyleName(sourceStyle)})</Label>
              <Textarea value={inputCitations} onChange={(e) => setInputCitations(e.target.value)} className="flex-1 resize-none font-mono text-sm" placeholder={`Paste your citations in ${getStyleName(sourceStyle)} format here...\n\nExample:\nSmith, J. (2020). Introduction to AI. Tech Press.\nDoe, J., & Smith, A. (2021). Machine learning basics. Academic Publishing.`} />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">Converted Citations ({getStyleName(targetStyle)})</Label>
              <Textarea value={convertedCitations} readOnly className="flex-1 resize-none font-mono text-sm bg-muted" placeholder="Converted citations will appear here..." />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CitationGenerator;
