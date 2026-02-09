import { useState } from "react";
import { useGemini, PromptType } from "@/hooks/useGemini";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Copy,
  RotateCcw,
  Loader2,
  Plus,
  AlertCircle,
  Wand2,
  Upload,
  Link,
  ArrowRightLeft,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import {
  CitationForm,
  CitationList,
  StyleSelector,
} from "@/components/citation";
import {
  type Citation,
  type SourceType,
  type CitationStyle,
  formatManualCitation,
  getStyleName,
  generateCitationId,
} from "@/utils/citation-formatter";
import {
  generateCitationFromDocument,
  generateCitationFromURL,
  logFileMetadata,
  extractPDFMetadata,
  type PDFMetadata,
} from "@/utils/citation-extractor";

const CitationGenerator = () => {
  const { generateContent, loading, error } = useGemini();
  const [activeTab, setActiveTab] = useState<"create" | "auto" | "convert">(
    "create",
  );

  // Create tab state
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

  // Auto-generate tab state
  const [autoStyle, setAutoStyle] = useState<CitationStyle>("apa");
  const [urlInput, setUrlInput] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [autoCitation, setAutoCitation] = useState("");
  const [pdfMetadata, setPdfMetadata] = useState<PDFMetadata | null>(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Handlers
  const handleInputChange = (field: keyof Citation, value: string) => {
    setCurrentCitation((prev) => ({ ...prev, [field]: value }));
  };

  const buildSourceInfo = (): string => {
    const parts: string[] = [];
    if (currentCitation.authors)
      parts.push(`Author(s): ${currentCitation.authors}`);
    if (currentCitation.title) parts.push(`Title: ${currentCitation.title}`);
    if (currentCitation.year) parts.push(`Year: ${currentCitation.year}`);

    switch (sourceType) {
      case "book":
        if (currentCitation.publisher)
          parts.push(`Publisher: ${currentCitation.publisher}`);
        if (currentCitation.pages)
          parts.push(`Pages: ${currentCitation.pages}`);
        break;
      case "website":
        if (currentCitation.websiteName)
          parts.push(`Website Name: ${currentCitation.websiteName}`);
        if (currentCitation.url) parts.push(`URL: ${currentCitation.url}`);
        if (currentCitation.accessDate)
          parts.push(`Access Date: ${currentCitation.accessDate}`);
        break;
      case "journal":
        if (currentCitation.journalName)
          parts.push(`Journal: ${currentCitation.journalName}`);
        if (currentCitation.volume)
          parts.push(`Volume: ${currentCitation.volume}`);
        if (currentCitation.issue)
          parts.push(`Issue: ${currentCitation.issue}`);
        if (currentCitation.pages)
          parts.push(`Pages: ${currentCitation.pages}`);
        if (currentCitation.doi) parts.push(`DOI: ${currentCitation.doi}`);
        break;
      case "video":
        if (currentCitation.channelName)
          parts.push(`Channel: ${currentCitation.channelName}`);
        if (currentCitation.videoUrl)
          parts.push(`URL: ${currentCitation.videoUrl}`);
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
        const prompt = `Generate a citation in ${getStyleName(
          citationStyle,
        )} format for the following source:\n\nSource Type: ${sourceType}\n${sourceInfo}\n\nPlease provide ONLY the formatted citation, nothing else. Follow ${getStyleName(
          citationStyle,
        )} guidelines exactly.`;
        formattedCitation = (
          await generateContent({ prompt, type: PromptType.CONVERTER })
        ).trim();
      } catch (err) {
        toast.error(
          `Failed to generate citation: ${
            err instanceof Error ? err.message : "Unknown error"
          }`,
        );
        return;
      }
    } else {
      formattedCitation = formatManualCitation(
        currentCitation,
        sourceType,
        citationStyle,
      );
    }

    const newCitation: Citation = {
      id: generateCitationId(),
      sourceType,
      ...currentCitation,
      authors: currentCitation.authors || "",
      title: currentCitation.title || "",
      year: currentCitation.year || "",
      formatted: {
        ...({} as Record<CitationStyle, string>),
        [citationStyle]: formattedCitation,
      },
    };

    setCitations((prev) => [...prev, newCitation]);
    setCurrentCitation({});
    toast.success("Citation generated!");
  };

  const handleCopyAllCitations = () => {
    if (citations.length === 0) return;
    const allCitations = citations
      .map((c) => c.formatted?.[citationStyle] || "")
      .filter(Boolean)
      .join("\n\n");
    navigator.clipboard.writeText(allCitations);
    toast.success("All citations copied!");
  };

  const handleDownload = () => {
    if (citations.length === 0) return;
    const content =
      `BIBLIOGRAPHY (${getStyleName(citationStyle)})\n\n` +
      citations
        .map((c) => c.formatted?.[citationStyle] || "")
        .filter(Boolean)
        .join("\n\n");
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

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      "text/plain",
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/markdown",
    ];

    if (
      !allowedTypes.includes(file.type) &&
      !file.name.endsWith(".txt") &&
      !file.name.endsWith(".md") &&
      !file.name.endsWith(".pdf")
    ) {
      toast.error("Please upload a TXT, MD, PDF, or DOCX file");
      return;
    }

    setDocumentName(file.name);
    setPdfMetadata(null);

    try {
      // Handle PDF files
      console.log(file.type);
      if (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      ) {
        setLoadingPdf(true);
        const metadata = await extractPDFMetadata(file);
        setLoadingPdf(false);

        if (metadata) {
          setPdfMetadata(metadata);
          setDocumentContent(metadata.extractedText);
          toast.success("PDF metadata extracted!");
        } else {
          toast.error("Failed to extract PDF metadata");
        }
      } else if (
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md")
      ) {
        const text = await file.text();
        logFileMetadata(file, text);
        setDocumentContent(text.slice(0, 5000));
        toast.success("File loaded successfully!");
      } else {
        logFileMetadata(file);
        setDocumentContent(`[Document: ${file.name}]`);
        toast.info("Document loaded.");
      }
    } catch {
      setLoadingPdf(false);
      toast.error("Failed to read file");
    }
  };

  // Manual citation from document
  const handleManualCitationFromDocument = () => {
    if (!documentContent && !documentName) {
      toast.error("Please upload a document first");
      return;
    }
    const formattedCitation = generateCitationFromDocument(
      documentContent,
      documentName,
      autoStyle,
    );
    setAutoCitation(formattedCitation);
    toast.success("Manual citation generated!");
  };

  // AI citation from document
  const handleGenerateFromDocument = async () => {
    if (!documentContent && !documentName) {
      toast.error("Please upload a document first");
      return;
    }

    try {
      const prompt = `Based on the following document information, extract metadata and generate a citation in ${getStyleName(
        autoStyle,
      )} format.

Document Name: ${documentName}
Document Content (excerpt):
${documentContent.slice(0, 3000)}

Please:
1. Extract or infer: Author(s), Title, Year, Publisher (if applicable)
2. Determine the source type (book, article, report, etc.)
3. Generate a properly formatted ${getStyleName(autoStyle)} citation

If information is missing, make reasonable inferences from the content or use [Unknown] placeholders.

Output ONLY the formatted citation, nothing else.`;

      const result = await generateContent({
        prompt,
        type: PromptType.CONVERTER,
      });
      setAutoCitation(result.trim());
      toast.success("Citation generated from document!");
    } catch (err) {
      toast.error(
        `Failed to generate citation: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  // Manual citation from URL
  const handleManualCitationFromURL = () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }
    const formattedCitation = generateCitationFromURL(urlInput, autoStyle);
    setAutoCitation(formattedCitation);
    toast.success("Manual citation generated!");
  };

  // AI citation from URL
  const handleGenerateFromURL = async () => {
    if (!urlInput.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    try {
      const prompt = `Generate a citation in ${getStyleName(
        autoStyle,
      )} format for the following URL:

URL: ${urlInput}

Please:
1. Infer the source type (website, online article, video, etc.)
2. Extract or infer: Author/Organization, Title, Website Name, Publication Date
3. Include the access date as today's date
4. Generate a properly formatted ${getStyleName(autoStyle)} citation

Output ONLY the formatted citation, nothing else.`;

      const result = await generateContent({
        prompt,
        type: PromptType.CONVERTER,
      });
      setAutoCitation(result.trim());
      toast.success("Citation generated from URL!");
    } catch (err) {
      toast.error(
        `Failed to generate citation: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  const handleAddAutoCitation = () => {
    if (!autoCitation) return;
    const newCitation: Citation = {
      id: generateCitationId(),
      sourceType: "website",
      authors: "Auto-generated",
      title: documentName || urlInput || "Unknown",
      year: new Date().getFullYear().toString(),
      formatted: {
        ...({} as Record<CitationStyle, string>),
        [autoStyle]: autoCitation,
      },
    };
    setCitations((prev) => [...prev, newCitation]);
    toast.success("Citation added to list!");
  };

  // Convert citations
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
      const prompt = `Convert the following citations from ${getStyleName(
        sourceStyle,
      )} format to ${getStyleName(
        targetStyle,
      )} format.\n\nInput Citations (${getStyleName(
        sourceStyle,
      )}):\n${inputCitations}\n\nPlease convert each citation to ${getStyleName(
        targetStyle,
      )} format. Maintain the same order. Output ONLY the converted citations, one per line, with no additional text or explanations.`;
      const result = await generateContent({
        prompt,
        type: PromptType.CONVERTER,
      });
      setConvertedCitations(result.trim());
      toast.success("Citations converted!");
    } catch (err) {
      toast.error(
        `Failed to convert citations: ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      );
    }
  };

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleReset = () => {
    setCurrentCitation({});
    toast.info("Form cleared");
  };

  const handleResetAuto = () => {
    setUrlInput("");
    setDocumentContent("");
    setDocumentName("");
    setAutoCitation("");
    setPdfMetadata(null);
    toast.info("Form cleared");
  };

  const handleResetAll = () => {
    setCitations([]);
    setCurrentCitation({});
    setInputCitations("");
    setConvertedCitations("");
    toast.info("All cleared");
  };

  return (
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Citation Generator</h1>
        <p className="text-muted-foreground">
          Create citations in multiple formats or convert between citation
          styles
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "create" | "auto" | "convert")}
      >
        <TabsList className="mb-4">
          <TabsTrigger value="create">
            <Plus className="h-4 w-4 mr-2" />
            Create Citations
          </TabsTrigger>
          <TabsTrigger value="auto">
            <Upload className="h-4 w-4 mr-2" />
            Auto-Generate
          </TabsTrigger>
          <TabsTrigger value="convert">
            <ArrowRightLeft className="h-4 w-4 mr-2" />
            Convert Format
          </TabsTrigger>
        </TabsList>

        {/* Create Tab */}
        <TabsContent value="create" className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Source Information</CardTitle>
                <CardDescription>
                  Enter details about your source
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CitationForm
                  sourceType={sourceType}
                  citationStyle={citationStyle}
                  currentCitation={currentCitation}
                  useAI={useAI}
                  onSourceTypeChange={setSourceType}
                  onStyleChange={setCitationStyle}
                  onInputChange={handleInputChange}
                  onUseAIChange={setUseAI}
                />
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={handleGenerateCitation}
                    disabled={loading && useAI}
                  >
                    {loading && useAI ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Generate Citation
                      </>
                    )}
                  </Button>
                  <Button onClick={handleReset} variant="outline">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <CitationList
              citations={citations}
              citationStyle={citationStyle}
              error={error}
              onDelete={handleDeleteCitation}
              onCopyAll={handleCopyAllCitations}
              onDownload={handleDownload}
            />
          </div>
        </TabsContent>

        {/* Auto-Generate Tab */}
        <TabsContent value="auto" className="flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload Document</CardTitle>
                <CardDescription>
                  Upload a document to generate a citation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StyleSelector value={autoStyle} onChange={setAutoStyle} />
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-3">
                    Upload a document (TXT, MD, PDF, DOCX)
                  </p>
                  <Button variant="outline" asChild disabled={loadingPdf}>
                    <label htmlFor="doc-upload" className="cursor-pointer">
                      {loadingPdf ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        "Choose File"
                      )}
                      <input
                        id="doc-upload"
                        type="file"
                        accept=".txt,.md,.docx,.pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </Button>
                  {documentName && (
                    <p className="mt-3 text-sm font-medium text-green-600 dark:text-green-400">
                      ✓ {documentName}
                    </p>
                  )}
                </div>

                {/* PDF Metadata Display */}
                {pdfMetadata && (
                  <div className="border rounded-lg p-4 bg-muted/50 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <FileText className="h-4 w-4" /> PDF Metadata
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {pdfMetadata.title && (
                        <div>
                          <span className="text-muted-foreground">Title:</span>{" "}
                          {pdfMetadata.title}
                        </div>
                      )}
                      {pdfMetadata.author && (
                        <div>
                          <span className="text-muted-foreground">Author:</span>{" "}
                          {pdfMetadata.author}
                        </div>
                      )}
                      {pdfMetadata.creationDate && (
                        <div>
                          <span className="text-muted-foreground">
                            Created:
                          </span>{" "}
                          {pdfMetadata.creationDate}
                        </div>
                      )}
                      {pdfMetadata.pageCount > 0 && (
                        <div>
                          <span className="text-muted-foreground">Pages:</span>{" "}
                          {pdfMetadata.pageCount}
                        </div>
                      )}
                      {pdfMetadata.subject && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Subject:
                          </span>{" "}
                          {pdfMetadata.subject}
                        </div>
                      )}
                      {pdfMetadata.keywords && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Keywords:
                          </span>{" "}
                          {pdfMetadata.keywords}
                        </div>
                      )}
                      {pdfMetadata.doi && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">DOI:</span>{" "}
                          {pdfMetadata.doi}
                        </div>
                      )}
                      {pdfMetadata.isbn && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">ISBN:</span>{" "}
                          {pdfMetadata.isbn}
                        </div>
                      )}
                      {pdfMetadata.creator && (
                        <div>
                          <span className="text-muted-foreground">
                            Creator:
                          </span>{" "}
                          {pdfMetadata.creator}
                        </div>
                      )}
                      {pdfMetadata.producer && (
                        <div>
                          <span className="text-muted-foreground">
                            Producer:
                          </span>{" "}
                          {pdfMetadata.producer}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Button
                    onClick={handleManualCitationFromDocument}
                    disabled={!documentName}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Manual Citation
                  </Button>
                  <Button
                    onClick={handleGenerateFromDocument}
                    disabled={loading || !documentName}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generate from URL</CardTitle>
                <CardDescription>
                  Enter a URL to generate a citation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="url-input">Website URL</Label>
                  <div className="relative">
                    <Link className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="url-input"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/article"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Button
                    onClick={handleManualCitationFromURL}
                    disabled={!urlInput.trim()}
                    className="w-full"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Generate Manual Citation
                  </Button>
                  <Button
                    onClick={handleGenerateFromURL}
                    disabled={loading || !urlInput.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Generated Citation</CardTitle>
                  <CardDescription>
                    Review and add to your bibliography
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(autoCitation)}
                    disabled={!autoCitation}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddAutoCitation}
                    disabled={!autoCitation}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add to List
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleResetAuto}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {autoCitation ? (
                <Textarea
                  value={autoCitation}
                  onChange={(e) => setAutoCitation(e.target.value)}
                  className="font-mono text-sm min-h-[100px] resize-none"
                  placeholder="Generated citation will appear here..."
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No citation generated yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Convert Tab */}
        <TabsContent value="convert" className="flex-1 flex flex-col">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-lg">Convert Citation Format</CardTitle>
              <CardDescription>
                Paste citations in one format and convert them to another (uses
                AI)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 items-end">
                <StyleSelector
                  value={sourceStyle}
                  onChange={setSourceStyle}
                  label="Source Format"
                />
                <div className="flex justify-center">
                  <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                </div>
                <StyleSelector
                  value={targetStyle}
                  onChange={setTargetStyle}
                  label="Target Format"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConvertCitations}
                  disabled={loading || !inputCitations.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Convert
                    </>
                  )}
                </Button>
                <Button onClick={handleResetAll} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={() => handleCopy(convertedCitations)}
                  variant="outline"
                  disabled={!convertedCitations}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
            <div className="flex flex-col">
              <Label className="mb-2">
                Input Citations ({getStyleName(sourceStyle)})
              </Label>
              <Textarea
                value={inputCitations}
                onChange={(e) => setInputCitations(e.target.value)}
                className="flex-1 resize-none font-mono text-sm"
                placeholder="Paste your citations here..."
              />
            </div>
            <div className="flex flex-col">
              <Label className="mb-2">
                Converted Citations ({getStyleName(targetStyle)})
              </Label>
              <Textarea
                value={convertedCitations}
                readOnly
                className="flex-1 resize-none font-mono text-sm bg-muted"
                placeholder="Converted citations will appear here..."
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CitationGenerator;
