import { JSX, useEffect } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createTextNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand } from "lexical";
import { $createMapNode, MapNode } from "../nodes/MapNode";
import { BiSolidMap } from "react-icons/bi";

export const INSERT_MAP_COMMAND = createCommand('insertMap');

export function MapPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([MapNode])) {
            throw new Error('MapPlugin: MapNode not registered on editor');
        }

        return editor.registerCommand(INSERT_MAP_COMMAND, () => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) {
                return false;
            }

            const mapNode = $createMapNode();
            selection.insertNodes([mapNode]);

            const textNode = $createTextNode('');
            mapNode.append(textNode);
            textNode.select();
            return true;
        }, COMMAND_PRIORITY_LOW);
    }, [editor]);

    return null;
}

export function MapToolbarPlugin():JSX.Element {
    const [editor] = useLexicalComposerContext();

    const onClick = ():void => {
        editor.dispatchCommand(INSERT_MAP_COMMAND, undefined);
    }

    return (
        <button
            onClick={onClick}
            className={`toolbar-item spaced`}
            aria-label='google map element'
            type="button"
        >
            <div className='text-2xl'><BiSolidMap/></div>
        </button>
    )
}
