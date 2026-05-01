import {
  $applyNodeReplacement,
  type DOMConversionMap,
  type DOMExportOutput,
  type LexicalNodeReplacement,
  type NodeKey,
} from "lexical";
import {
  BeautifulMentionNode,
  type BeautifulMentionsItemData,
  type SerializedBeautifulMentionNode,
} from "lexical-beautiful-mentions";

const parseMentionData = (
  dataAttribute: string | null,
): Record<string, BeautifulMentionsItemData> | undefined => {
  if (!dataAttribute) {
    return undefined;
  }

  try {
    return JSON.parse(dataAttribute) as Record<string, BeautifulMentionsItemData>;
  } catch {
    return undefined;
  }
};

const convertMentionElement = (domNode: HTMLElement) => {
  const trigger = domNode.getAttribute("data-lexical-beautiful-mention-trigger");
  const value = domNode.getAttribute("data-lexical-beautiful-mention-value");
  const data = parseMentionData(
    domNode.getAttribute("data-lexical-beautiful-mention-data"),
  );

  if (!trigger || !value) {
    return null;
  }

  return {
    node: $createUserMentionNode(trigger, value, data),
  };
};

export class UserMentionNode extends BeautifulMentionNode {
  static getType() {
    return "user-beautifulMention";
  }

  static clone(node: UserMentionNode) {
    return new UserMentionNode(
      node.__trigger,
      node.__value,
      node.__data,
      node.__key,
    );
  }

  constructor(
    trigger: string,
    value: string,
    data?: Record<string, BeautifulMentionsItemData>,
    key?: NodeKey,
  ) {
    super(trigger, value, data, key);
  }

  exportDOM(): DOMExportOutput {
    const data = this.getData();
    const userId = typeof data?.userId === "string" ? data.userId : null;
    const element = document.createElement(userId ? "a" : "span");

    element.setAttribute("data-lexical-beautiful-mention", "true");
    element.setAttribute(
      "data-lexical-beautiful-mention-trigger",
      this.getTrigger(),
    );
    element.setAttribute(
      "data-lexical-beautiful-mention-value",
      this.getValue(),
    );
    element.className = "editor-mention-link";

    if (data) {
      element.setAttribute(
        "data-lexical-beautiful-mention-data",
        JSON.stringify(data),
      );
    }

    if (userId) {
      element.setAttribute("href", `/user/${userId}`);
    }

    element.textContent = this.getTextContent();

    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    const fromMentionElement = (domNode: Node) => {
      if (!(domNode instanceof HTMLElement)) {
        return null;
      }

      if (!domNode.hasAttribute("data-lexical-beautiful-mention")) {
        return null;
      }

      return {
        conversion: () => convertMentionElement(domNode),
        priority: 1 as const,
      };
    };

    return {
      a: fromMentionElement,
      span: fromMentionElement,
    };
  }

  static importJSON(serializedNode: SerializedBeautifulMentionNode) {
    return new UserMentionNode(
      serializedNode.trigger,
      serializedNode.value,
      serializedNode.data,
    );
  }

  exportJSON(): SerializedBeautifulMentionNode {
    const data = this.getData();

    return {
      trigger: this.getTrigger(),
      value: this.getValue(),
      ...(data ? { data } : {}),
      type: "user-beautifulMention",
      version: 1,
    };
  }
}

export function $createUserMentionNode(
  trigger: string,
  value: string,
  data?: Record<string, BeautifulMentionsItemData>,
) {
  return $applyNodeReplacement(new UserMentionNode(trigger, value, data));
}

export const UserMentionNodes: [
  typeof UserMentionNode,
  LexicalNodeReplacement,
] = [
  UserMentionNode,
  {
    replace: BeautifulMentionNode,
    with: (node: BeautifulMentionNode) =>
      new UserMentionNode(node.getTrigger(), node.getValue(), node.getData()),
    withKlass: UserMentionNode,
  },
];
