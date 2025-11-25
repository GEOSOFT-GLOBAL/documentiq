/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  ImageRun,
  Math,
} from "docx";
import { saveAs } from "file-saver";
import { convertLatexToOMML } from "./latex-to-omml";

interface ParsedNode {
  type: string;
  content?: string;
  children?: ParsedNode[];
  attrs?: Record<string, unknown>;
  isEquation?: boolean;
  latex?: string;
}

// Extract LaTeX equations from HTML content
function extractLatexEquations(html: string): string {
  // Match both inline $...$ and display $$...$$  equations
  const displayEquationRegex = /\$\$(.*?)\$\$/gs;
  const inlineEquationRegex = /\$([^$]+?)\$/g;

  let result = html;

  // Replace display equations with placeholders first (to avoid conflicts with inline)
  result = result.replace(displayEquationRegex, (_match, latex) => {
    return `[EQUATION:DISPLAY:${latex.trim()}]`;
  });

  // Replace inline equations with placeholders
  result = result.replace(inlineEquationRegex, (_match, latex) => {
    return `[EQUATION:INLINE:${latex.trim()}]`;
  });

  return result;
}

function parseHTMLToNodes(html: string): ParsedNode[] {
  const parser = new DOMParser();
  const processedHtml = extractLatexEquations(html);
  const doc = parser.parseFromString(processedHtml, "text/html");
  const nodes: ParsedNode[] = [];

  function traverseNode(node: Node): ParsedNode | null {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";
      if (!text.trim()) return null;

      // Check for equation placeholders
      const displayEqMatch = text.match(/\[EQUATION:DISPLAY:(.*?)\]/);
      const inlineEqMatch = text.match(/\[EQUATION:INLINE:(.*?)\]/);

      if (displayEqMatch && displayEqMatch[1]) {
        return {
          type: "equation",
          content: displayEqMatch[1],
          isEquation: true,
          latex: displayEqMatch[1],
        };
      }

      if (inlineEqMatch && inlineEqMatch[1]) {
        return {
          type: "equation",
          content: inlineEqMatch[1],
          isEquation: true,
          latex: inlineEqMatch[1],
        };
      }

      return { type: "text", content: text };
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();
      const children: ParsedNode[] = [];

      Array.from(element.childNodes).forEach((child) => {
        const parsed = traverseNode(child);
        if (parsed) children.push(parsed);
      });

      return {
        type: tagName,
        children,
        attrs: {},
      };
    }

    return null;
  }

  Array.from(doc.body.childNodes).forEach((node) => {
    const parsed = traverseNode(node);
    if (parsed) nodes.push(parsed);
  });

  return nodes;
}

function createTextRun(
  node: ParsedNode,
  bold = false,
  italic = false,
  underline = false
): TextRun {
  return new TextRun({
    text: node.content || "",
    bold,
    italics: italic,
    underline: underline ? {} : undefined,
  });
}

async function nodeToParagraph(node: ParsedNode): Promise<Paragraph[]> {
  const paragraphs: Paragraph[] = [];

  async function processNode(
    n: ParsedNode,
    bold = false,
    italic = false,
    underline = false
  ): Promise<(TextRun | ImageRun)[]> {
    const runs: (TextRun | ImageRun)[] = [];

    if (n.type === "text") {
      runs.push(createTextRun(n, bold, italic, underline));
      return runs;
    }

    if (n.type === "equation" && n.latex) {
      // Convert LaTeX to OMML (Office Math Markup Language)
      try {
        const omml = convertLatexToOMML(n.latex);

        // Create a Math object with the OMML
        const mathRun = new Math({
          children: [
            {
              type: "mathRun",
              children: [],
            } as any,
          ],
        });

        // Inject the OMML directly
        (mathRun as any).root = [omml];

        runs.push(mathRun as any);
      } catch (error) {
        console.error("Error creating equation:", error);
        // Fallback to formatted text
        runs.push(
          new TextRun({
            text: n.latex,
            italics: true,
            font: "Cambria Math",
            size: 24,
            color: "0070C0",
          })
        );
      }
      return runs;
    }

    const isBold = bold || n.type === "strong" || n.type === "b";
    const isItalic = italic || n.type === "em" || n.type === "i";
    const isUnderline = underline || n.type === "u";

    if (n.children) {
      for (const child of n.children) {
        const childRuns = await processNode(
          child,
          isBold,
          isItalic,
          isUnderline
        );
        runs.push(...childRuns);
      }
    }

    return runs;
  }

  if (node.type === "p") {
    const childRuns = await Promise.all(
      (node.children || []).map((child) => processNode(child))
    );
    const runs = childRuns.flat();
    paragraphs.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: "" })],
        spacing: { after: 200 },
      })
    );
  } else if (node.type === "h1" || node.type === "h2" || node.type === "h3") {
    const childRuns = await Promise.all(
      (node.children || []).map((child) => processNode(child))
    );
    const runs = childRuns.flat();
    const heading =
      node.type === "h1"
        ? HeadingLevel.HEADING_1
        : node.type === "h2"
        ? HeadingLevel.HEADING_2
        : HeadingLevel.HEADING_3;

    paragraphs.push(
      new Paragraph({
        children: runs.length > 0 ? runs : [new TextRun({ text: "" })],
        heading,
        spacing: { after: 200 },
      })
    );
  } else if (node.type === "ul" || node.type === "ol") {
    for (const li of node.children || []) {
      if (li.type === "li") {
        const childRuns = await Promise.all(
          (li.children || []).map((child) => processNode(child))
        );
        const runs = childRuns.flat();
        paragraphs.push(
          new Paragraph({
            children: runs.length > 0 ? runs : [new TextRun({ text: "" })],
            bullet: node.type === "ul" ? { level: 0 } : undefined,
            numbering:
              node.type === "ol"
                ? { reference: "default-numbering", level: 0 }
                : undefined,
            spacing: { after: 100 },
          })
        );
      }
    }
  } else if (node.type === "div" || node.type === "span") {
    for (const child of node.children || []) {
      const childParagraphs = await nodeToParagraph(child);
      paragraphs.push(...childParagraphs);
    }
  } else if (node.type === "equation") {
    // Handle standalone equation nodes
    const runs = await processNode(node);
    if (runs.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { after: 200, before: 200 },
          alignment: AlignmentType.CENTER,
        })
      );
    }
  } else {
    const childRuns = await Promise.all(
      (node.children || []).map((child) => processNode(child))
    );
    const runs = childRuns.flat();
    if (runs.length > 0) {
      paragraphs.push(
        new Paragraph({
          children: runs,
          spacing: { after: 200 },
        })
      );
    }
  }

  return paragraphs;
}

async function createDocxDocument(htmlContent: string): Promise<Document> {
  const nodes = parseHTMLToNodes(htmlContent);
  const paragraphs: Paragraph[] = [];

  // Process all nodes and collect paragraphs
  for (const node of nodes) {
    const nodeParagraphs = await nodeToParagraph(node);
    paragraphs.push(...nodeParagraphs);
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [new TextRun({ text: "Empty document" })],
      })
    );
  }

  return new Document({
    sections: [
      {
        properties: {},
        children: paragraphs,
      },
    ],
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [
            {
              level: 0,
              format: "decimal",
              text: "%1.",
              alignment: AlignmentType.START,
            },
          ],
        },
      ],
    },
  });
}

export async function downloadAsDocx(
  htmlContent: string,
  filename = "document.docx"
) {
  try {
    const doc = await createDocxDocument(htmlContent);
    const blob = await Packer.toBlob(doc);
    saveAs(blob, filename);
    return true;
  } catch (error) {
    console.error("Error downloading DOCX:", error);
    return false;
  }
}

export async function copyAsDocx(htmlContent: string) {
  try {
    const doc = await createDocxDocument(htmlContent);
    const blob = await Packer.toBlob(doc);

    // Create a ClipboardItem with the blob
    const clipboardItem = new ClipboardItem({
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        blob,
    });

    await navigator.clipboard.write([clipboardItem]);
    return true;
  } catch (error) {
    console.error("Error copying to clipboard:", error);
    return false;
  }
}
