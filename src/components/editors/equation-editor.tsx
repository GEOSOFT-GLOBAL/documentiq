import { useState } from "react";
import { Editor, Viewer } from "react-latex-editor";
import "react-latex-editor/styles";
import { Copy, Download } from "lucide-react";
import { copyAsDocx, downloadAsDocx } from "@/utils/export-to-docx";
import { toast } from "sonner";

export function EquationEditor() {
  const [content, setContent] = useState("<p>Start typing...</p>");
  const [isCopying, setIsCopying] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopyAsDocx = async () => {
    setIsCopying(true);
    try {
      const success = await copyAsDocx(content);
      if (success) {
        toast.success("Copied to clipboard as DOCX!");
      } else {
        toast.error("Failed to copy to clipboard");
      }
    } catch (error) {
      toast.error("Error copying to clipboard");
      console.error(error);
    } finally {
      setIsCopying(false);
    }
  };

  const handleDownloadAsDocx = async () => {
    setIsDownloading(true);
    try {
      const success = await downloadAsDocx(content, "equation-document.docx");
      if (success) {
        toast.success("Document downloaded successfully!");
      } else {
        toast.error("Failed to download document");
      }
    } catch (error) {
      toast.error("Error downloading document");
      console.error(error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-180px)] relative">
      <Editor
        placeholder="Paste equations from ChatGPT, Word, Google Docs..."
        initialContent={content}
        onChange={setContent}
        className="h-full text-black"
      />
      
      {/* Floating Viewer */}
      <div className="fixed bottom-4 right-4 w-[400px] h-[400px] bg-white border border-gray-300 rounded-lg shadow-2xl overflow-hidden z-50 flex flex-col">
        <div className="bg-gray-800 text-white px-4 py-2 font-semibold flex items-center justify-between">
          <span>Preview</span>
          <div className="flex gap-2">
            <button
              onClick={handleCopyAsDocx}
              disabled={isCopying}
              className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded text-sm transition-colors"
              title="Copy to clipboard as DOCX"
            >
              {isCopying ? (
                <>
                  <Copy className="w-4 h-4 animate-pulse" />
                  Copying...
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleDownloadAsDocx}
              disabled={isDownloading}
              className="flex items-center gap-1.5 px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm transition-colors"
              title="Download as DOCX file"
            >
              {isDownloading ? (
                <>
                  <Download className="w-4 h-4 animate-bounce" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          </div>
        </div>
        <div className="p-4 overflow-auto flex-1">
          <Viewer
            content={content}
            className="my-viewer"
            contentClassName="custom-content"
            enableMath={true}
            mathJaxConfig={{
              inlineMath: [["$", "$"]],
              displayMath: [["$$", "$$"]],
              packages: ["base", "ams"],
            }}
          />
        </div>
      </div>
    </div>
  );
}
