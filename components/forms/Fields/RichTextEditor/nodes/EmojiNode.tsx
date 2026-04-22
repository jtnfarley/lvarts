/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorConfig, LexicalNode, NodeKey, SerializedTextNode, Spread} from 'lexical';

import {TextNode} from 'lexical';

export type SerializedEmojiNode = Spread<
    {
        unifiedID: string;
        imageUrl?: string;
    },
    SerializedTextNode
>;

function parseNativeEmoji(unifiedID: string): string {
    return unifiedID
        .split('-')
        .map((hex) => parseInt(hex, 16))
        .filter((codePoint) => !Number.isNaN(codePoint))
        .map((codePoint) => String.fromCodePoint(codePoint))
        .join('');
}

function getEmojiImageUrl(unifiedID: string): string {
    return `https://cdn.jsdelivr.net/npm/emoji-datasource-facebook/img/facebook/64/${unifiedID}.png`;
}

function normalizeUnifiedID(value: string): string {
    const normalizedValue = value.toLowerCase();

    if (!normalizedValue.includes('/')) {
        return normalizedValue;
    }

    const unifiedMatch = normalizedValue.match(/([0-9a-f-]+)\.png$/i);
    return unifiedMatch?.[1] ?? normalizedValue;
}

export class EmojiNode extends TextNode {
    __unifiedID: string;

    static getType(): string {
        return 'EmojiNode';
    }

    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__unifiedID, node.__key);
    }

    constructor(unifiedID: string, key?: NodeKey) {
        const normalizedUnifiedID = normalizeUnifiedID(unifiedID);
        super(parseNativeEmoji(normalizedUnifiedID), key);
        this.__unifiedID = normalizedUnifiedID;
    }

    decorateDOM(dom: HTMLElement): void {
        dom.className = 'emoji-node';
        dom.textContent = parseNativeEmoji(this.__unifiedID);
        dom.style.backgroundImage = `url("${getEmojiImageUrl(this.__unifiedID)}")`;
        dom.style.backgroundPosition = 'center';
        dom.style.backgroundRepeat = 'no-repeat';
        dom.style.backgroundSize = 'contain';
        dom.style.color = 'transparent';
        dom.style.display = 'inline-block';
        dom.style.height = '1.5em';
        dom.style.width = '1.5em';
        dom.style.overflow = 'hidden';
        dom.style.verticalAlign = 'middle';
        dom.style.whiteSpace = 'nowrap';
        dom.setAttribute('data-emoji-unified-id', this.__unifiedID);
        dom.setAttribute('aria-label', parseNativeEmoji(this.__unifiedID));
    }

    createDOM(_config: EditorConfig): HTMLElement {
        const dom = super.createDOM(_config);
        this.decorateDOM(dom);
        return dom;
    }

    updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
        const isUpdated = super.updateDOM(prevNode, dom, config);

        if (prevNode.__unifiedID !== this.__unifiedID) {
            this.decorateDOM(dom);
        }

        return isUpdated;
    }

    static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
        return $createEmojiNode(serializedNode.unifiedID ?? serializedNode.imageUrl ?? '');
    }

    exportJSON(): SerializedEmojiNode {
        return {
            ...super.exportJSON(),
            unifiedID: this.__unifiedID,
        };
    }

    canInsertTextBefore(): boolean {
        return false;
    }

    canInsertTextAfter(): boolean {
        return false;
    }

    isTextEntity(): true {
        return true;
    }
}

export function $createEmojiNode(unifiedID: string): EmojiNode {
    const node = new EmojiNode(unifiedID)
        // In token mode node can be navigated through character-by-character,
        // but are deleted as a single entity (not invdividually by character).
        // This also forces Lexical to create adjacent TextNode on user input instead of
        // modifying Emoji node as it now acts as immutable node.
        .setMode('token');

    return node;
}

export function $isEmojiNode(node: LexicalNode | null | undefined): node is EmojiNode {
    return node instanceof EmojiNode;
}
