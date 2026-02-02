/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {EditorConfig, NodeKey, SerializedTextNode, Spread} from 'lexical';

import {TextNode} from 'lexical';

export type SerializedEmojiNode = Spread<
    {
        imageUrl: string;
    },
    SerializedTextNode
>;

// @emoji-datasource-facebook is defined in vite.config.ts
const BASE_EMOJI_URI = new URL(`emoji-datasource-facebook/`, import.meta.url).href;

export class EmojiNode extends TextNode {
    __imageUrl: string;

    static getType(): string {
        return 'EmojiNode';
    }

    static clone(node: EmojiNode): EmojiNode {
        return new EmojiNode(node.__imageUrl, node.__key);
    }

    constructor(imageUrl: string, key?: NodeKey) {
        // const unicodeEmoji = String.fromCodePoint(
        //     ...imageUrl.split('-').map((v) => parseInt(v, 16)),
        // );
        super(imageUrl, key);

        this.__imageUrl = imageUrl.toLowerCase();
    }

    /**
     * DOM that will be rendered by browser within contenteditable
     * This is what Lexical renders
     */
    createDOM(_config: EditorConfig): HTMLElement {
        let imageUrl;

        if (this.__imageUrl) {
            imageUrl =  this.__imageUrl;
        }
        const dom = document.createElement('img');
        dom.className = 'emoji-node';
        dom.src = imageUrl || '';
        dom.style.width = `20px`;
        dom.style.height = `20px`;
        dom.innerText = ' ';
        return dom;
    }

    static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
        return $createEmojiNode(serializedNode.imageUrl);
    }

    exportJSON(): SerializedEmojiNode {
        return {
            ...super.exportJSON(),
            imageUrl: this.__imageUrl,
        };
    }
}

export function $createEmojiNode(imageUrl: string): EmojiNode {
    const node = new EmojiNode(imageUrl)
        // In token mode node can be navigated through character-by-character,
        // but are deleted as a single entity (not invdividually by character).
        // This also forces Lexical to create adjacent TextNode on user input instead of
        // modifying Emoji node as it now acts as immutable node.
        .setMode('token');

    return node;
}
