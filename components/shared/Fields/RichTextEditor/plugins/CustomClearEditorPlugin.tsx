import React, { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";

export default function CustomClearEditorPlugin(props:{clearEditor:boolean}) {
  const [editor] = useLexicalComposerContext();
  
  useEffect(() => {
    if (props.clearEditor) {
      editor.update(() => {
        const root = $getRoot();
        root.clear();
        dispatchEvent(new Event('editorUpdated'));
      });
    }
  }, [props.clearEditor])

  return (
    <></>
  );
}
