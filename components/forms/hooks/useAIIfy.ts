'use client'

import { useRef, useState } from "react";
import { $createParagraphNode, $createTextNode, $getRoot, LexicalEditor } from "lexical";
import { boringAdjectives } from "@/lib/utils";
import { getAITextResponse } from "@/app/actions/openAIBridge";

export const useAIIfy = (setIsSaving: (saving: boolean) => void) => {
    const [isAIIfied, setIsAIIfied] = useState(false);
    const [showTones, setShowTones] = useState(false);
    const contentBackup = useRef<string[]>([]);

    const aiIfy = async (editorRef: React.RefObject<LexicalEditor | null>, adjective = 'funny') => {
        if (!editorRef.current) return;

        setShowTones(false);

        const text = editorRef.current.getEditorState().read(() => $getRoot().getTextContent().trim());
        if (!text) return;

        setIsSaving(true);
        contentBackup.current.push(text);

        const prompt = `You are a ${adjective} person. Rewrite this post in a ${adjective} tone: ${text}. keep the response under 400 characters. if ${adjective} === 'weird', then get weird with it.`;

        try {
            const res = await getAITextResponse(prompt);

            editorRef.current.update(() => {
                const root = $getRoot();
                const lines = res.split(/\r?\n/);

                root.clear();

                lines.forEach((line: string) => {
                    const paragraph = $createParagraphNode();
                    if (line.length > 0) paragraph.append($createTextNode(line));
                    root.append(paragraph);
                });

                const note = $createTextNode(`Post formatted by AI for funsies.`);
                note.setFormat('italic');
                const noteParagraph = $createParagraphNode();
                noteParagraph.append(note);
                root.append(noteParagraph);

                if (lines.length === 0) root.append($createParagraphNode());

                root.selectEnd();
            });

            setIsAIIfied(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    const resetPost = (editorRef: React.RefObject<LexicalEditor | null>) => {
        if (!editorRef.current) return;

        try {
            editorRef.current.update(() => {
                const root = $getRoot();
                root.clear();

                if (contentBackup.current.length) {
                    const paragraph = $createParagraphNode();
                    paragraph.append($createTextNode(contentBackup.current[0]));
                    root.append(paragraph);
                }
            });
        } catch (error) {
            console.error(error);
        }

        setIsAIIfied(false);
    };

    return { isAIIfied, showTones, setShowTones, boringAdjectives, aiIfy, resetPost };
};
