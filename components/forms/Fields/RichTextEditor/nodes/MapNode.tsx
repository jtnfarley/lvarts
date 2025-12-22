import { ElementNode } from "lexical";
import type { EditorConfig, LexicalNode } from "lexical";
import {addClassNamesToElement} from '@lexical/utils'

export class MapNode extends ElementNode {
    static getType():string {
        return 'MapNode';
    }
    static clone(node:MapNode):MapNode {
        return new MapNode(node.__key);
    }

    createDOM(config: EditorConfig): HTMLElement {
        const div = document.createElement('div');
        const p1 = document.createElement('p');
        const p2 = document.createElement('p');
        const p3 = document.createElement('p');
        addClassNamesToElement(div, config.theme.map);
        // const span1 = document.createElement('span');
        p1.textContent = '[ADDRESS]'
        // const span2 = document.createElement('span');
        p3.textContent = '[/ADDRESS]'
        div.appendChild(p1)
        div.appendChild(p2)
        div.appendChild(p3)
        // div.textContent = '[ADDRESS][/ADDRESS]'
        // console.log(this.)
        return div;
    }

    updateDOM(_prevNode: unknown, _dom: HTMLElement, _config: EditorConfig): boolean {
        return false;
    }
}

export function $createMapNode(): MapNode {
    return new MapNode;
}

export function $isMapNode(node:LexicalNode): node is MapNode {
    return node instanceof MapNode;
}