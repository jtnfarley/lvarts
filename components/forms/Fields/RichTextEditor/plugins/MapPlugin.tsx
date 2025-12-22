import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, createCommand } from "lexical";
import {$setBlocksType} from '@lexical/selection';
import { $createMapNode, MapNode } from "../nodes/MapNode";
import { BiSolidMap } from "react-icons/bi";
import { JSX } from "react";

export const INSERT_MAP_COMMAND = createCommand('insertMap');

export function MapPlugin(): null {
    const [editor] = useLexicalComposerContext();

    if (!editor.hasNodes([MapNode])) {
        throw new Error('MapPlugin: MapNode not registered on editor');
    }

    editor.registerCommand(INSERT_MAP_COMMAND, () => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            $setBlocksType(selection, $createMapNode)
        }
        return true;
    }, COMMAND_PRIORITY_LOW)
    return null;
}

export function MapToolbarPlugin():JSX.Element {
    const [editor] = useLexicalComposerContext();

    const onClick = (e:React.MouseEvent):void => {
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