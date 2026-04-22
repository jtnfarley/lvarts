/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {$getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, TextNode} from 'lexical';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { createCommand } from "lexical";
import {$createEmojiNode, EmojiNode} from '../nodes/EmojiNode';
import findEmoji from '../findEmoji';
import { JSX, useEffect, useRef, useState } from 'react';
import EmojiPicker from 'emoji-picker-react';
import type { EmojiClickData } from 'emoji-picker-react';
import { BiSmile } from "react-icons/bi";
import { mergeRegister } from '@lexical/utils';

export const INSERT_EMOJI_COMMAND = createCommand<EmojiClickData>('insertEmoji');

function $textNodeTransform(node: TextNode): void {
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
            throw new Error('EmojiPlugin: EmojiNode not registered on editor');
        }

        return mergeRegister(
            editor.registerNodeTransform(TextNode, $textNodeTransform),
            editor.registerCommand(INSERT_EMOJI_COMMAND, (data: EmojiClickData) => {
                const selection = $getSelection();

                if (!$isRangeSelection(selection)) {
                    return false;
                }

                const emojiNode = $createEmojiNode(data.unified);
                selection.insertNodes([emojiNode]);

                return true;
            }, COMMAND_PRIORITY_LOW),
        );
    }, [editor]);

    return null;
}

export function EmojiToolbarPlugin():JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [emojiOpen, setEmojiOpen] = useState<boolean>(false);
    const pickerRef = useRef<HTMLDivElement | null>(null);

    const openEmojiPicker = ():void => {
        setEmojiOpen(prev => !prev);
    }

    const insertEmoji = (emojiObject: EmojiClickData) => {
        editor.dispatchCommand(INSERT_EMOJI_COMMAND, emojiObject);
        setEmojiOpen(false);
    }

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent | TouchEvent): void => {
            if (!pickerRef.current?.contains(event.target as Node)) {
                setEmojiOpen(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('touchstart', handlePointerDown);

        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('touchstart', handlePointerDown);
        };
    }, []);

    return (
        <div ref={pickerRef} className='relative mx-2 mt-1'>
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
