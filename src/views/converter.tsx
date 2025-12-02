import { useState } from "react";
import { useWasmConverter } from "@/hooks/useWasmConverter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Download, FileText, Code, FileCode, Printer } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
      // For PDF, open in new window for print-to-PDF
      handlePrintToPdf();
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
    try {
      toast.info("Generating PDF...");

      // Create a temporary container
      const container = document.createElement("div");
      container.innerHTML = output;
      container.style.position = "absolute";
      container.style.left = "-9999px";
      container.style.width = "800px";
      container.style.padding = "40px";
      container.style.backgroundColor = "white";
      document.body.appendChild(container);

      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false,
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

      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("document.pdf");

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
    <div className="h-full flex flex-col p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Document Converter</h1>
        <p className="text-muted-foreground">
          High-performance document conversion powered by Rust/WASM
        </p>
      </div>

      <Tabs
        value={conversionType}
        onValueChange={(v) => setConversionType(v as ConversionType)}
        className="mb-4"
      >
        <TabsList>
          <TabsTrigger value="md-html">
            <FileText className="h-4 w-4 mr-2" />
            MD → HTML
          </TabsTrigger>
          <TabsTrigger value="md-pdf">
            <FileText className="h-4 w-4 mr-2" />
            MD → PDF
          </TabsTrigger>
          <TabsTrigger value="latex-mathml">
            <Code className="h-4 w-4 mr-2" />
            LaTeX → MathML
          </TabsTrigger>
          <TabsTrigger value="latex-pdf" disabled>
            <Code className="h-4 w-4 mr-2" />
            LaTeX → PDF
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleConvert} disabled={!input}>
          Convert
        </Button>
        <Button onClick={loadExample} variant="outline">
          Load Example
        </Button>
        {conversionType === "md-pdf" ? (
          <>
            <Button
              onClick={handleDownload}
              variant="outline"
              disabled={!output}
            >
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button
              onClick={handleBrowserPrint}
              variant="outline"
              disabled={!output}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </>
        ) : (
          <Button onClick={handleDownload} variant="outline" disabled={!output}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0">
        <div className="flex flex-col">
          <Label className="mb-2">Input</Label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-4 border rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter your content here..."
          />
        </div>

        <div className="flex flex-col">
          <Label className="mb-2">Output</Label>
          <div className="flex-1 p-4 border rounded-md bg-muted overflow-auto">
            {output ? (
              <pre className="font-mono text-sm whitespace-pre-wrap">
                {output}
              </pre>
            ) : (
              <p className="text-muted-foreground">
                Output will appear here...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Converter;
