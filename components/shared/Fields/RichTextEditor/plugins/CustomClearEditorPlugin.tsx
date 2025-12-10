import React, { useEffect, useState } from "react";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import { $getRoot, $insertNodes } from "lexical";

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
