import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { LOW_PRIORITY, RICH_TEXT_OPTIONS, RichTextAction } from "../constants";
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import {INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, $insertList, $removeList} from '@lexical/list'
import { useEffect, useState } from 'react';
import {mergeRegister} from '@lexical/utils';
import { MapToolbarPlugin } from './MapPlugin';

function Divider(props:{key:string}) {
  return <div className="divider border border-right"/>;
}

export default function ToolbarPlugin() {
    const [editor] = useLexicalComposerContext();

    const [selectionMap, setSelectionMap] = useState<{[id:string]:boolean}>({});

    const onAction = (id:RichTextAction) => {
        switch(id) {
            case RichTextAction.Bold:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
                break;
            case RichTextAction.Italics:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
                break;
            case RichTextAction.Underline:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
                break;
            case RichTextAction.Strikethrough:
                editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
                break;
            case RichTextAction.LeftAlign:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
                break;
            case RichTextAction.CenterAlign:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
                break;
            case RichTextAction.RightAlign:
                editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
                break;
            case RichTextAction.UnorderedList:
                editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
                break;
            case RichTextAction.OrderedList:
                editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
                break;
            case RichTextAction.Divider:
                break;
        }
    }

    const updateToolbar = () => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
            const newSelectionMap = {
                [RichTextAction.Bold]: selection.hasFormat('bold'),
                [RichTextAction.Italics]: selection.hasFormat('italic'),
                [RichTextAction.Underline]: selection.hasFormat('underline'),
                [RichTextAction.Strikethrough]: selection.hasFormat('strikethrough'),
            }
            setSelectionMap(newSelectionMap);
        }
    }

    const getSelectedBtnProps = (isSelected:boolean) => isSelected ? 'active' : ''

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({editorState}) => {
                editorState.read(() => {
                    updateToolbar();
                })
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (payload) => {
                    updateToolbar();
                    return false;
                },
                LOW_PRIORITY
            ),
        )
    }, [])

    return (
        <div className="flex pb-1 border-b-1">
            {
                RICH_TEXT_OPTIONS.map(({id, label, icon}, index) => (
                    id === RichTextAction.Divider ? <Divider key={index.toString()}/> :
                    <button
                        onClick={() => onAction(id)}
                        className={`toolbar-item spaced ${getSelectedBtnProps(selectionMap[id])}`}
                        aria-label={label}
                        key={id}
                        type="button"
                    >
                        <div className='text-2xl '>{icon}</div>
                    </button>
                ))
            }
            {/* <MapToolbarPlugin/> */}
        </div>
    )
}