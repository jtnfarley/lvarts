import { JSX } from "react";

import { $isAutoLinkNode, AutoLinkNode } from "@lexical/link";
import {
  AutoLinkPlugin as _AutoLinkPlugin,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNodeByKey } from "lexical";
import { useEffect } from "react";

const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;

const MATCHERS = [
  (text:string) => {
    const match = URL_MATCHER.exec(text);
    if (match === null) {
      return null;
    }
    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      text: fullMatch,
      url: fullMatch.startsWith('http') ? fullMatch : `https://${fullMatch}`,
    };
  },
];

export default function AutoLinkPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor) return;
    const removeNodeListener = editor.registerMutationListener(
      AutoLinkNode,
      (mutatedNodes) => {
        mutatedNodes.forEach((mutation, nodeKey) => {
          if (mutation === "created") {
            editor.update(() => {
              const node = $getNodeByKey(nodeKey);
              if ($isAutoLinkNode(node)) {
                node.setTarget("_blank");
              }
            });
          }
        });
    }
    );
    return () => removeNodeListener();
  }, [editor]);

  return <_AutoLinkPlugin matchers={MATCHERS} />;
}
