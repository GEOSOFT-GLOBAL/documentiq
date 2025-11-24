import { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import Split from "react-split";

const defaultHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; background: #f0f0f0; }
    h1 { color: #333; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello from Live Editor! 👋</h1>
    <p>Edit the code on the left → see changes instantly.</p>
    <button onclick="alert('It works!')">Click me</button>
  </div>
</body>
</html>`;

export default function LiveCodeEditor() {
  const [html, setHtml] = useState(defaultHtml);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Update iframe on code change (debounced for performance)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument;
        if (doc) {
          doc.open();
          doc.write(html);
          doc.close();
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [html]);

  return (
    <div className="h-[calc(100vh-180px)] flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">HTML/CSS/JS Live Editor</h1>
      </div>

      {/* Split Editor + Preview */}
      <Split
        className="flex flex-1"
        sizes={[50, 50]}
        minSize={300}
        gutterSize={10}
      >
        {/* Monaco Editor */}
        <div className="bg-gray-900 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="html"
            value={html}
            onChange={(value) => setHtml(value || "")}
            theme="vs-dark"
            options={{
              fontSize: 15,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>

        {/* Live Preview */}
        <div className="bg-white flex flex-col">
          <div className="bg-gray-800 px-4 py-2 text-sm border-b border-gray-700">
            Preview
          </div>
          <iframe
            ref={iframeRef}
            title="preview"
            className="w-full flex-1 border-0"
            sandbox="allow-scripts allow-modals allow-popups"
          />
        </div>
      </Split>
    </div>
  );
}
