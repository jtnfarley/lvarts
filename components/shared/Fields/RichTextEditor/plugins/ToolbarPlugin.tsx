import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import { LOW_PRIORITY, RICH_TEXT_OPTIONS, RichTextAction } from "../constants";
import { $getSelection, $isRangeSelection, FORMAT_ELEMENT_COMMAND, FORMAT_TEXT_COMMAND, SELECTION_CHANGE_COMMAND } from 'lexical';
import {INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, $insertList, $removeList} from '@lexical/list'
import { useEffect, useState } from 'react';
import {mergeRegister} from '@lexical/utils';

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
        </div>
    )
}
// import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
// import {mergeRegister} from '@lexical/utils';
// import {
//   $getSelection,
//   $isRangeSelection,
//   CAN_REDO_COMMAND,
//   CAN_UNDO_COMMAND,
//   COMMAND_PRIORITY_LOW,
//   FORMAT_ELEMENT_COMMAND,
//   FORMAT_TEXT_COMMAND,
//   REDO_COMMAND,
//   SELECTION_CHANGE_COMMAND,
//   UNDO_COMMAND,
// } from 'lexical';
// import {useCallback, useEffect, useRef, useState} from 'react';

// function Divider() {
//   return <div className="divider" />;
// }

// export default function ToolbarPlugin() {
//   const [editor] = useLexicalComposerContext();
//   const toolbarRef = useRef(null);
//   const [canUndo, setCanUndo] = useState(false);
//   const [canRedo, setCanRedo] = useState(false);
//   const [isBold, setIsBold] = useState(false);
//   const [isItalic, setIsItalic] = useState(false);
//   const [isUnderline, setIsUnderline] = useState(false);
//   const [isStrikethrough, setIsStrikethrough] = useState(false);

//   const $updateToolbar = useCallback(() => {
//     const selection = $getSelection();
//     if ($isRangeSelection(selection)) {
//       // Update text format
//       setIsBold(selection.hasFormat('bold'));
//       setIsItalic(selection.hasFormat('italic'));
//       setIsUnderline(selection.hasFormat('underline'));
//       setIsStrikethrough(selection.hasFormat('strikethrough'));
//     }
//   }, []);

//   useEffect(() => {
//     return mergeRegister(
//       editor.registerUpdateListener(({editorState}) => {
//         editorState.read(
//           () => {
//             $updateToolbar();
//           },
//           {editor},
//         );
//       }),
//       editor.registerCommand(
//         SELECTION_CHANGE_COMMAND,
//         (_payload, _newEditor) => {
//           $updateToolbar();
//           return false;
//         },
//         COMMAND_PRIORITY_LOW,
//       ),
//       editor.registerCommand(
//         CAN_UNDO_COMMAND,
//         (payload) => {
//           setCanUndo(payload);
//           return false;
//         },
//         COMMAND_PRIORITY_LOW,
//       ),
//       editor.registerCommand(
//         CAN_REDO_COMMAND,
//         (payload) => {
//           setCanRedo(payload);
//           return false;
//         },
//         COMMAND_PRIORITY_LOW,
//       ),
//     );
//   }, [editor, $updateToolbar]);

//   return (
//     <div className="toolbar" ref={toolbarRef}>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
//         }}
//         className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
//         aria-label="Format Bold">
//         <i className="format bold" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
//         }}
//         className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
//         aria-label="Format Italics">
//         <i className="format italic" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
//         }}
//         className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
//         aria-label="Format Underline">
//         <i className="format underline" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
//         }}
//         className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
//         aria-label="Format Strikethrough">
//         <i className="format strikethrough" />
//       </button>
//       <Divider />
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
//         }}
//         className="toolbar-item spaced"
//         aria-label="Left Align">
//         <i className="format left-align" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
//         }}
//         className="toolbar-item spaced"
//         aria-label="Center Align">
//         <i className="format center-align" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
//         }}
//         className="toolbar-item spaced"
//         aria-label="Right Align">
//         <i className="format right-align" />
//       </button>
//       <button
//         onClick={() => {
//           editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify');
//         }}
//         className="toolbar-item"
//         aria-label="Justify Align">
//         <i className="format justify-align" />
//       </button>{' '}
//     </div>
//   );
// }