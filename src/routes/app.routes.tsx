import Dashboard from "@/views";
import Paraphraser from "@/views/paraphraser";
import Converter from "@/views/converter";
import Editor from "@/views/editor";
import Summarizer from "@/views/summarizer";
import DiffCompare from "@/views/diff-compare";
import TextUtilities from "@/views/text-utilities";
import ReadabilityAnalyzer from "@/views/readability-analyzer";
import KeywordExtractor from "@/views/keyword-extractor";
import CitationGenerator from "@/views/citation-generator";
import LanguageTranslator from "@/views/language-translator";
import QRGenerator from "@/views/qr-generator";
import Settings from "@/views/settings";

export const appRoutes = [
  {
    index: true,
    element: <Dashboard />,
  },
  {
    path: "paraphraser",
    element: <Paraphraser />,
  },
  {
    path: "converter",
    element: <Converter />,
  },
  {
    path: "editor",
    element: <Editor />,
  },
  {
    path: "summarizer",
    element: <Summarizer />,
  },
  {
    path: "diff-compare",
    element: <DiffCompare />,
  },
  {
    path: "text-utilities",
    element: <TextUtilities />,
  },
  {
    path: "readability-analyzer",
    element: <ReadabilityAnalyzer />,
  },
  {
    path: "keyword-extractor",
    element: <KeywordExtractor />,
  },
  {
    path: "citation-generator",
    element: <CitationGenerator />,
  },
  {
    path: "translator",
    element: <LanguageTranslator />,
  },
  {
    path: "qr-generator",
    element: <QRGenerator />,
  },
  {
    path: "settings",
    element: <Settings />,
  },
];
