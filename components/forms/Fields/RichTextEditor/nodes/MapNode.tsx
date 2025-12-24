import { ElementNode } from "lexical";
import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedElementNode,
} from "lexical";
import { addClassNamesToElement } from "@lexical/utils";

type SerializedMapNode = SerializedElementNode & {
  type: "MapNode";
  version: 1;
};

export class MapNode extends ElementNode {
  constructor(key?: NodeKey) {
    super(key);
  }

  static getType(): string {
    return "MapNode";
  }

  static clone(node: MapNode): MapNode {
    return new MapNode(node.__key);
  }

  static importJSON(_serializedNode: SerializedMapNode): MapNode {
    return $createMapNode();
  }

  exportJSON(): SerializedMapNode {
    return {
      ...super.exportJSON(),
      type: "MapNode",
      version: 1,
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    addClassNamesToElement(div, config.theme.map);
    div.setAttribute("data-lexical-map", "true");
    return div;
  }

  updateDOM(_prevNode: MapNode, _dom: HTMLElement): boolean {
    return false;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const element = document.createElement("div");
    element.setAttribute("data-lexical-map", "true");

    return {
      element,
      after: (domNode) => {
        if (domNode instanceof HTMLElement) {
          const open = document.createElement("span");
          open.textContent = "[ADDRESS]";
          domNode.insertBefore(open, domNode.firstChild);

          const close = document.createElement("span");
          close.textContent = "[/ADDRESS]";
          domNode.appendChild(close);
        }
        return domNode;
      },
    };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      div: (domNode: Node) => {
        if (!(domNode instanceof HTMLElement)) {
          return null;
        }

        return domNode.getAttribute("data-lexical-map") === "true"
          ? {
              conversion: (element: HTMLElement): DOMConversionOutput | null => {
                const wrappers = Array.from(element.childNodes).filter((child) => {
                  const text = child.textContent?.trim();
                  return text === "[ADDRESS]" || text === "[/ADDRESS]";
                });

                wrappers.forEach((child) => child.remove());
                return { node: $createMapNode() };
              },
              priority: 2,
            }
          : null;
      },
    };
  }
}

export function $createMapNode(): MapNode {
  return new MapNode();
}

export function $isMapNode(node: LexicalNode | null | undefined): node is MapNode {
  return node instanceof MapNode;
}
