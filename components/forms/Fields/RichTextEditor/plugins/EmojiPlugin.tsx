/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$createTextNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, TextNode} from 'lexical';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createCommand } from "lexical";
import {$createEmojiNode, EmojiNode} from '../nodes/EmojiNode';
import findEmoji from '../findEmoji';
import { JSX, useEffect, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { BiSmile } from "react-icons/bi";

export const INSERT_EMOJI_COMMAND = createCommand('insertEmoji');

function $textNodeTransform(node: TextNode): void {
    console.log(node)
    if (!node.isSimpleText() || node.hasFormat('code')) {
        return;
    }

    const text = node.getTextContent();

    // Find only 1st occurrence as transform will be re-run anyway for the rest
    // because newly inserted nodes are considered to be dirty
    const emojiMatch = findEmoji(text);
    if (emojiMatch === null) {
        return;
    }

    let targetNode;
    if (emojiMatch.position === 0) {
        // First text chunk within string, splitting into 2 parts
        [targetNode] = node.splitText(
            emojiMatch.position + emojiMatch.shortcode.length,
        );
    } else {
        // In the middle of a string
        [, targetNode] = node.splitText(
            emojiMatch.position,
            emojiMatch.position + emojiMatch.shortcode.length,
        );
    }

    const emojiNode = $createEmojiNode(emojiMatch.unifiedID);
    targetNode.replace(emojiNode);
}

export function EmojiPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([EmojiNode])) {
            throw new Error('MapPlugin: MapNode not registered on editor');
        }

        editor.registerNodeTransform(TextNode, $textNodeTransform);

        return editor.registerCommand(INSERT_EMOJI_COMMAND, (data:any) => {
            const selection = $getSelection();

            if (!$isRangeSelection(selection)) {
                return false;
            }

            const emojiNode = $createEmojiNode(data?.imageUrl);
            selection.insertNodes([emojiNode]);

            // const textNode = $createTextNode('');
            // mapNode.append(textNode);
            // textNode.select();
            return true;
        }, COMMAND_PRIORITY_LOW);
    }, [editor]);

    return null;
}

export function EmojiToolbarPlugin():JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [emojiOpen, setEmojiOpen] = useState<boolean>(false);

    const openEmojiPicker = ():void => {
        setEmojiOpen(prev => !prev);
    }

    const insertEmoji = (emojiObject:any) => {
        editor.dispatchCommand(INSERT_EMOJI_COMMAND, emojiObject);
    }

    return (
        <div className='relative mx-2 mt-1'>
            <button
                onClick={openEmojiPicker}
                className={`toolbar-item spaced`}
                aria-label={'Emoji Button'}
                type="button"
            >
                <BiSmile />
            </button>
            <div className='absolute left-[20px] top-[-20px]'>
                <EmojiPicker onEmojiClick={(emojiObject) => insertEmoji(emojiObject)} open={emojiOpen} />
            </div>
        </div>
    )
}
