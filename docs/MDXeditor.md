```tsx
import React from "react";
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  toolbarPlugin,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  DiffSourceToggleWrapper,
  diffSourcePlugin,
  InsertCodeBlock,
  InsertImage,
  codeBlockPlugin,
  codeMirrorPlugin,
  headingsPlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  ListsToggle,
  InsertThematicBreak,
  Separator,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

const MDXEditorComponent = () => {
  const [markdown, setMarkdown] = React.useState(
    "# Hello World\n\nStart editing your markdown here..."
  );

  return (
    <div className="w-full h-full">
      <MDXEditor
        markdown={markdown}
        onChange={setMarkdown}
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          imagePlugin(),
          codeBlockPlugin({ defaultCodeBlockLanguage: "js" }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              js: "JavaScript",
              css: "CSS",
              txt: "text",
              tsx: "TypeScript",
              ts: "TypeScript",
            },
          }),
          diffSourcePlugin({ viewMode: "rich-text", diffMarkdown: "" }),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <DiffSourceToggleWrapper>
                  <UndoRedo />
                  <Separator />
                  <BoldItalicUnderlineToggles />
                  <Separator />
                  <BlockTypeSelect />
                  <Separator />
                  <CodeToggle />
                  <Separator />
                  <CreateLink />
                  <Separator />
                  <InsertImage />
                  <Separator />
                  <ListsToggle />
                  <Separator />
                  <InsertCodeBlock />
                  <Separator />
                  <InsertThematicBreak />
                </DiffSourceToggleWrapper>
              </>
            ),
          }),
        ]}
      />
    </div>
  );
};

export default MDXEditorComponent;
```
