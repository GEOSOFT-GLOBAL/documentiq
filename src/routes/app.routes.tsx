import Dashboard from "@/views";
import Paraphraser from "@/views/paraphraser";
import Converter from "@/views/converter";
import Editor from "@/views/editor";
import Summarizer from "@/views/summarizer";

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
];
