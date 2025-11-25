import { TeX } from "mathjax-full/js/input/tex";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages";
import { SerializedMmlVisitor } from "mathjax-full/js/core/MmlTree/SerializedMmlVisitor";
import { mml2omml } from "mathml2omml";
import { mathjax } from "mathjax-full/js/mathjax";
import { SVG } from "mathjax-full/js/output/svg";

// Initialize MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "none" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

export function convertLatexToOMML(latex: string): string {
  try {
    // Step 1: Create a MathItem from LaTeX
    const mathItem = html.convert(latex, {
      display: true,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    });

    // Step 2: Get the internal MathML representation
    const visitor = new SerializedMmlVisitor();
    const mathml = visitor.visitTree(mathItem.root);

    // Step 3: Convert MathML to OMML (Office Math Markup Language)
    const omml = mml2omml(mathml);

    return omml;
  } catch (error) {
    console.error("Error converting LaTeX to OMML:", error, "LaTeX:", latex);
    // Return a fallback OMML with the LaTeX as text
    return `<m:oMath xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"><m:r><m:t>${escapeXml(
      latex
    )}</m:t></m:r></m:oMath>`;
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
