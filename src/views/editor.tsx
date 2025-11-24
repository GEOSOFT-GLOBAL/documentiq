import React from "react";
import MDEditor from "@uiw/react-md-editor";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TiptapEditor from "@/components/editors/tiptap";
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'
import LiveCodeEditor from "@/components/editors/code-editor";

const Editor = () => {
  const [value, setValue] = React.useState("**Hello world!**");
  const [htmlValue, setHtmlValue] = React.useState("<p>Hello world!</p>");

  return (
    <div className="w-full h-full p-4">
      <Tabs defaultValue="markdown" className="w-full h-full">
        <TabsList>
          <TabsTrigger value="markdown">Markdown Editor</TabsTrigger>
          <TabsTrigger value="richtext">Rich Text Editor</TabsTrigger>
          <TabsTrigger value="html">HTML Editor</TabsTrigger>
          <TabsTrigger value="equation">Equation Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="markdown" className="h-full">
          <MDEditor
            value={value}
            preview="edit"
            height="calc(100vh - 180px)"
            onChange={(val) => setValue(val || "")}
          />
        </TabsContent>

        <TabsContent value="richtext" className="h-full">
          <TiptapEditor content={htmlValue} onChange={setHtmlValue} />
        </TabsContent>

        <TabsContent value="html" className="h-full">
          <LiveCodeEditor/>
        </TabsContent>
        
        <TabsContent value="equation" className="h-full">
          <SimpleEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Editor;
