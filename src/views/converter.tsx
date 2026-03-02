import { useState } from "react";
import { useWasmConverter } from "@/hooks/useWasmConverter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Download, FileText, Code, FileCode, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

type ConversionType = "md-html" | "md-pdf" | "latex-mathml" | "latex-pdf";

const Converter = () => {
  const {
    loading,
    error,
    ready,
    convertMarkdownToHtml,
    convertMarkdownToPdfHtml,
    convertLatexToMathML,
  } = useWasmConverter();

  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [conversionType, setConversionType] =
    useState<ConversionType>("md-html");
  const [showPdfDialog, setShowPdfDialog] = useState(false);
  const [pdfFilename, setPdfFilename] = useState("document.pdf");

  const handleConvert = () => {
    if (!ready) {
      toast.error("Converter not ready");
      return;
    }

    try {
      let result = "";

      switch (conversionType) {
        case "md-html":
          result = convertMarkdownToHtml(input);
          break;
        case "md-pdf":
          result = convertMarkdownToPdfHtml(input, "Document");
          break;
        case "latex-mathml":
          result = convertLatexToMathML(input);
          break;
        case "latex-pdf":
          // For LaTeX to PDF, we'd need additional processing
          toast.info("LaTeX to PDF requires server-side processing");
          return;
        default:
          toast.error("Unknown conversion type");
          return;
      }

      setOutput(result);
      toast.success("Conversion complete!");
    } catch (err) {
      toast.error(`Conversion failed: ${err}`);
    }
  };

  const handleDownload = () => {
    if (!output) {
      toast.error("No output to download");
      return;
    }

    if (conversionType === "md-pdf") {
      // Show dialog for PDF options
      setShowPdfDialog(true);
      return;
    }

    const blob = new Blob([output], { type: getOutputMimeType() });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getOutputFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Downloaded!");
  };

  const handlePrintToPdf = async () => {
    setShowPdfDialog(false);
    
    try {
      toast.info("Generating PDF...");

      // Create a temporary container with fixed width
      const container = document.createElement("div");
      container.innerHTML = output;
      // container.style.position = "fixed";
      // container.style.left = "-10000px";
      container.style.top = "0";
      container.style.width = "210mm"; // A4 width
      container.style.minHeight = "297mm"; // A4 height
      container.style.padding = "20mm";
      // container.style.backgroundColor = "white";
      container.style.boxSizing = "border-box";
      document.body.appendChild(container);

      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
        windowWidth: container.scrollWidth,
        windowHeight: container.scrollHeight,
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add additional pages if content is longer than one page
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      pdf.save(pdfFilename);

      toast.success("PDF downloaded!");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF. Try using browser Print instead.");
    }
  };

  const handleBrowserPrint = () => {
    // Open HTML in new window for print-to-PDF
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("Please allow popups to print");
      return;
    }

    printWindow.document.write(output);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        toast.success("Use Print dialog to save as PDF");
      }, 250);
    };
  };

  const getOutputMimeType = () => {
    switch (conversionType) {
      case "md-html":
      case "md-pdf":
        return "text/html";
      case "latex-mathml":
        return "application/mathml+xml";
      default:
        return "text/plain";
    }
  };

  const getOutputFilename = () => {
    switch (conversionType) {
      case "md-html":
        return "output.html";
      case "md-pdf":
        return "output.html";
      case "latex-mathml":
        return "output.mathml";
      default:
        return "output.txt";
    }
  };

  const exampleInputs: Record<ConversionType, string> = {
    "md-html": `# Hello World\n\nThis is **bold** and this is *italic*.\n\n- Item 1\n- Item 2\n\n\`\`\`javascript\nconsole.log('Hello');\n\`\`\``,
    "md-pdf": `# Document Title\n\n## Introduction\n\nThis document will be converted to PDF-ready HTML.\n\n### Features\n\n- Clean styling\n- Print-friendly\n- Professional layout`,
    "latex-mathml": `x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}`,
    "latex-pdf": `\\documentclass{article}\n\\begin{document}\nHello LaTeX!\n\\end{document}`,
  };

  const loadExample = () => {
    setInput(exampleInputs[conversionType]);
    setOutput("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading converter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center max-w-md">
          <FileCode className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Converter Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <p className="text-sm text-muted-foreground">
            Run:{" "}
            <code className="bg-muted px-2 py-1 rounded">
              cd rust-converter && ./build.ps1
            </code>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Dialog open={showPdfDialog} onOpenChange={setShowPdfDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download PDF</DialogTitle>
            <DialogDescription>
              Configure your PDF export settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={pdfFilename}
                onChange={(e) => setPdfFilename(e.target.value)}
                placeholder="document.pdf"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPdfDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePrintToPdf}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="h-full flex flex-col p-4 md:p-6 overflow-x-hidden">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Document Converter</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            High-performance document conversion powered by Rust/WASM
          </p>
        </div>

      <Tabs
        value={conversionType}
        onValueChange={(v) => setConversionType(v as ConversionType)}
        className="mb-4 w-full overflow-x-auto"
      >
        <TabsList className="flex w-full min-w-max">
          <TabsTrigger value="md-html" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">MD → HTML</span>
            <span className="sm:hidden">HTML</span>
          </TabsTrigger>
          <TabsTrigger value="md-pdf" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
            <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">MD → PDF</span>
            <span className="sm:hidden">PDF</span>
          </TabsTrigger>
          <TabsTrigger value="latex-mathml" className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
            <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">LaTeX → MathML</span>
            <span className="sm:hidden">MathML</span>
          </TabsTrigger>
          <TabsTrigger value="latex-pdf" disabled className="whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3">
            <Code className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">LaTeX → PDF</span>
            <span className="sm:hidden">LaTeX</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex flex-wrap gap-2 mb-4">
        <Button onClick={handleConvert} disabled={!input} size="sm">
          Convert
        </Button>
        <Button onClick={loadExample} variant="outline" size="sm">
          Load Example
        </Button>
        {conversionType === "md-pdf" ? (
          <>
            <Button
              onClick={handleDownload}
              variant="outline"
              disabled={!output}
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              onClick={handleBrowserPrint}
              variant="outline"
              disabled={!output}
              size="sm"
            >
              <Printer className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Print</span>
              <span className="sm:hidden">Print</span>
            </Button>
          </>
        ) : (
          <Button onClick={handleDownload} variant="outline" disabled={!output} size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 overflow-hidden">
        <div className="flex flex-col min-h-[200px] overflow-hidden">
          <Label className="mb-2 text-sm md:text-base">Input</Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 w-full p-3 md:p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[150px] box-border"
            placeholder="Enter your content here..."
          />
        </div>

        <div className="flex flex-col min-h-[200px] overflow-hidden">
          <Label className="mb-2 text-sm md:text-base">
            Output Preview
            {conversionType === "md-html" ||
            conversionType === "md-pdf" ||
            conversionType === "latex-pdf"
              ? " (Rendered)"
              : " (Source)"}
          </Label>
          <div className="flex-1 w-full border rounded-md overflow-hidden min-h-[150px] box-border">
            {output ? (
              conversionType === "md-html" || conversionType === "md-pdf" ? (
                <iframe
                  srcDoc={output}
                  className="w-full h-full bg-white"
                  sandbox="allow-same-origin"
                  title="Output Preview"
                />
              ) : (
                <div className="h-full p-3 md:p-4 bg-muted overflow-auto">
                  <pre className="font-mono text-xs md:text-sm whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              )
            ) : (
              <div className="h-full p-3 md:p-4 bg-muted flex items-center justify-center">
                <p className="text-muted-foreground text-sm">
                  Output will appear here...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default Converter;
