import React from "react";
import MDEditor from "@uiw/react-md-editor";

const Editor = () => {
  const [value, setValue] = React.useState("**Hello world!**");

  return (
    <div className="w-full h-full">
      <MDEditor
        value={value}
        preview="edit"
        height="calc(100vh - 100px)"
        onChange={(val) => setValue(val || "")}
      />
    </div>
  );
};

export default Editor;
