'use client'

import React, { useEffect, useState } from "react"
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {LexicalComposer} from '@lexical/react/LexicalComposer';
import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
import CustomOnChangePlugin from './plugins/CustomOnChangePlugin';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import CustomClearEditorPlugin from './plugins/CustomClearEditorPlugin';
import {HashtagPlugin} from '@lexical/react/LexicalHashtagPlugin';
import {ListPlugin} from '@lexical/react/LexicalListPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
// import {CharacterLimitPlugin} from '@lexical/react/LexicalCharacterLimitPlugin';
import {HashtagNode} from '@lexical/hashtag';
// import {OverflowNode} from '@lexical/overflow';
import {ListNode, ListItemNode} from '@lexical/list';
import {AutoLinkNode} from '@lexical/link';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import ExampleTheme from './ExampleTheme';
import RandoPlaceholder from "./RandoPlaceholder";
// import TreeViewPlugin from "./plugins/TreeViewPlugin";
import "./styles.css";

const EditorCapturePlugin = React.forwardRef((props: any, ref: any) => {
	const [editor] = useLexicalComposerContext();
	useEffect(() => {
		ref.current = editor;
		return () => {
			ref.current = null;
		};
	}, [editor, ref]);

	return null;
});

interface Props {
	onChange:Function
}

function onError(error:Error) {
	console.error(error)
}

const initialConfig = {
	namespace: 'MyEditor',
	theme: ExampleTheme,
	onError,
	nodes:[HashtagNode, ListNode, ListItemNode, AutoLinkNode],
	editorState:null
};

export default function RTEditor(props:{ref:any, onChange: (html:object) => void, clearEditor:boolean, content?:string}) {

	if (props.content) initialConfig.editorState = props.content;
	
	return <div>
		<LexicalComposer initialConfig={initialConfig}>
			<div className="editor-container">
				<ToolbarPlugin />
				<div className="editor-inner">
					<RichTextPlugin
						contentEditable={
							<ContentEditable
								aria-placeholder={'Enter some text...'}
								placeholder={
									<RandoPlaceholder/>
								}
								className="contentEditable w-full py-2 px-3 text-gray-700 focus:outline-none h-50"
							/>
						}
						ErrorBoundary={LexicalErrorBoundary}
					/>
				</div>
			</div>
			<AutoFocusPlugin/>
			<HistoryPlugin/>
			<ListPlugin/>
			<HashtagPlugin/>
			<AutoLinkPlugin/>
			{/* <CharacterLimitPlugin charset='UTF-16' maxLength={250}/> */}
			{/* <TreeViewPlugin/> */}
			<CustomOnChangePlugin value={''} onChange={props.onChange}/>
			<CustomClearEditorPlugin clearEditor={props.clearEditor}/>
		</LexicalComposer>
	</div>
}


// import { JSX, useState } from "react";
// import { EditorState } from "lexical";
// import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
// import {LexicalComposer} from '@lexical/react/LexicalComposer';
// import {ContentEditable} from '@lexical/react/LexicalContentEditable';
// import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
// import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
// import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
// import {OnChangePlugin} from '@lexical/react/LexicalOnChangePlugin';
// import ToolbarPlugin from './plugins/ToolbarPlugins';
// import TreeViewPlugin from './plugins/TreeViewPlugin';
// import ExampleTheme from './ExampleTheme';

// interface Props {
// 	onChange:Function
// }

// function onError(error:Error) {
// 	console.error(error)
// }

// export default function Editor(props:{onChange: (editorState:EditorState) => void}): JSX.Element {
// 	const [placeholder, setPlaceholder] = useState('Scream it into the ether');
// 	const initialConfig = {
// 		namespace: 'MyEditor',
// 		ExampleTheme,
// 		onError,
// 	};

// 	return (
// 		<LexicalComposer initialConfig={initialConfig}>
// 			<div className="editor-container">
// 				<ToolbarPlugin />
// 				<div className="editor-inner">
// 					<RichTextPlugin
// 						contentEditable={
// 							<ContentEditable
// 								aria-placeholder={'Enter some text...'}
// 								placeholder={
// 									<div className="editor-placeholder">{placeholder}</div>
// 								}
// 								className="contentEditable w-full py-2 px-3 text-gray-700 focus:outline-none h-50"
// 							/>
// 						}
// 						ErrorBoundary={LexicalErrorBoundary}
// 					/>
// 				</div>
// 			</div>
// 			<HistoryPlugin/>
// 			<OnChangePlugin onChange={props.onChange}/>
// 			<AutoFocusPlugin/>
// 			<TreeViewPlugin />
// 		</LexicalComposer>
// 	);
// }

// /**
//  * Copyright (c) Meta Platforms, Inc. and affiliates.
//  *
//  * This source code is licensed under the MIT license found in the
//  * LICENSE file in the root directory of this source tree.
//  *
//  */

// import {AutoFocusPlugin} from '@lexical/react/LexicalAutoFocusPlugin';
// import {LexicalComposer} from '@lexical/react/LexicalComposer';
// import {ContentEditable} from '@lexical/react/LexicalContentEditable';
// import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
// import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
// import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
// import {
//   $isTextNode,
//   DOMConversionMap,
//   DOMExportOutput,
//   DOMExportOutputMap,
//   isHTMLElement,
//   Klass,
//   LexicalEditor,
//   LexicalNode,
//   ParagraphNode,
//   TextNode,
// } from 'lexical';

// import ExampleTheme from './ExampleTheme';
// import ToolbarPlugin from './plugins/ToolbarPlugins';
// import TreeViewPlugin from './plugins/TreeViewPlugin';
// import {parseAllowedColor, parseAllowedFontSize} from './styleConfig';

// const placeholder = 'Enter some rich text...';

// const removeStylesExportDOM = (
//   editor: LexicalEditor,
//   target: LexicalNode,
// ): DOMExportOutput => {
//   const output = target.exportDOM(editor);
//   if (output && isHTMLElement(output.element)) {
//     // Remove all inline styles and classes if the element is an HTMLElement
//     // Children are checked as well since TextNode can be nested
//     // in i, b, and strong tags.
//     for (const el of [
//       output.element,
//       ...output.element.querySelectorAll('[style],[class]'),
//     ]) {
//       el.removeAttribute('class');
//       el.removeAttribute('style');
//     }
//   }
//   return output;
// };

// const exportMap: DOMExportOutputMap = new Map<
//   Klass<LexicalNode>,
//   (editor: LexicalEditor, target: LexicalNode) => DOMExportOutput
// >([
//   [ParagraphNode, removeStylesExportDOM],
//   [TextNode, removeStylesExportDOM],
// ]);

// const getExtraStyles = (element: HTMLElement): string => {
//   // Parse styles from pasted input, but only if they match exactly the
//   // sort of styles that would be produced by exportDOM
//   let extraStyles = '';
//   const fontSize = parseAllowedFontSize(element.style.fontSize);
//   const backgroundColor = parseAllowedColor(element.style.backgroundColor);
//   const color = parseAllowedColor(element.style.color);
//   if (fontSize !== '' && fontSize !== '15px') {
//     extraStyles += `font-size: ${fontSize};`;
//   }
//   if (backgroundColor !== '' && backgroundColor !== 'rgb(255, 255, 255)') {
//     extraStyles += `background-color: ${backgroundColor};`;
//   }
//   if (color !== '' && color !== 'rgb(0, 0, 0)') {
//     extraStyles += `color: ${color};`;
//   }
//   return extraStyles;
// };

// const constructImportMap = (): DOMConversionMap => {
//   const importMap: DOMConversionMap = {};

//   // Wrap all TextNode importers with a function that also imports
//   // the custom styles implemented by the playground
//   for (const [tag, fn] of Object.entries(TextNode.importDOM() || {})) {
//     importMap[tag] = (importNode) => {
//       const importer = fn(importNode);
//       if (!importer) {
//         return null;
//       }
//       return {
//         ...importer,
//         conversion: (element) => {
//           const output = importer.conversion(element);
//           if (
//             output === null ||
//             output.forChild === undefined ||
//             output.after !== undefined ||
//             output.node !== null
//           ) {
//             return output;
//           }
//           const extraStyles = getExtraStyles(element);
//           if (extraStyles) {
//             const {forChild} = output;
//             return {
//               ...output,
//               forChild: (child, parent) => {
//                 const textNode = forChild(child, parent);
//                 if ($isTextNode(textNode)) {
//                   textNode.setStyle(textNode.getStyle() + extraStyles);
//                 }
//                 return textNode;
//               },
//             };
//           }
//           return output;
//         },
//       };
//     };
//   }

//   return importMap;
// };

// const editorConfig = {
//   html: {
//     export: exportMap,
//     import: constructImportMap(),
//   },
//   namespace: 'React.js Demo',
//   nodes: [ParagraphNode, TextNode],
//   onError(error: Error) {
//     throw error;
//   },
//   theme: ExampleTheme,
// };

// export default function App() {
//   return (
//     <LexicalComposer initialConfig={editorConfig}>
//       <div className="editor-container">
//         <ToolbarPlugin />
//         <div className="editor-inner">
//           <RichTextPlugin
//             contentEditable={
//               <ContentEditable
//                 className="editor-input"
//                 aria-placeholder={placeholder}
//                 placeholder={
//                   <div className="editor-placeholder">{placeholder}</div>
//                 }
//               />
//             }
//             ErrorBoundary={LexicalErrorBoundary}
//           />
//           <HistoryPlugin />
//           <AutoFocusPlugin />
//           <TreeViewPlugin />
//         </div>
//       </div>
//     </LexicalComposer>
//   );
// }
