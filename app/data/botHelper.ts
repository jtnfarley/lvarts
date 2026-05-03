import hd from "@/lib/bots/hd";
import Post from "@/lib/models/post";

type LexicalTextNode = {
    detail: number;
    format: number;
    mode: "normal";
    style: string;
    text: string;
    type: "text";
    version: 1;
};

type LexicalParagraphNode = {
    children: LexicalTextNode[];
    direction: "ltr" | null;
    format: "";
    indent: number;
    type: "paragraph";
    version: 1;
};

type BotPost = {
    content: string;
    lexical: string;
    postType: string;
    userId: string;
    edited: boolean;
}

const createParagraphNode = (text:string, format = 0):LexicalParagraphNode => ({
    children: text ? [{
        detail: 0,
        format,
        mode: "normal",
        style: "",
        text,
        type: "text",
        version: 1,
    }] : [],
    direction: "ltr",
    format: "",
    indent: 0,
    type: "paragraph",
    version: 1,
});

const escapeHtml = (text:string) => {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export const getBotPost = (botName:string):BotPost | null => {
    const post = getPostByBotName(botName);
    return post;
}

const getPostByBotName = (botName:string):BotPost | null => {
    switch(botName) {
        case 'hd':
            return getHdPost();
        default:
            return null;
    }
}

const getHdPost = ():BotPost | null => {
    const userId = '69f7ad802f33441ec3cc373d';
    const hdPoems = hd;
    const hdPoem = hdPoems[Math.floor(Math.random() * hdPoems.length)]

    if (!hdPoem) {
        return null;
    }

    const formattedPost = getFormattedPost(hdPoem.lines);

    if (hdPoem) {
        if (hdPoem.title) {
            formattedPost.content = `<p class="editor-paragraph"><b><strong class="editor-text-bold" style="white-space: pre-wrap;">${escapeHtml(hdPoem.title)}</strong></b></p>${formattedPost.content}`;
            formattedPost.lexical.root.children.unshift(createParagraphNode(hdPoem.title, 1));
        }
    }

    return {
        content: formattedPost.content,
        lexical: JSON.stringify(formattedPost.lexical),
        postType: 'post',
        userId,
        edited: false,
    };
}

const getFormattedPost = (text:string) => {
    const lines:{
        content: string;
        lexical: {
            root: {
                children: LexicalParagraphNode[];
                direction: "ltr" | null;
                format: "";
                indent: number;
                type: "root";
                version: 1;
            }
        }
    } = {
        content: '',
        lexical: {
            root: {
                children: [],
                direction: "ltr",
                format: "",
                indent: 0,
                type: "root",
                version: 1,
            }
        }
    };

    const paragraphs = text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    lines.content = paragraphs.map((paragraph) => {
        const paragraphLines = paragraph
            .split('\n')
            .map((line) => `<span style="white-space: pre-wrap;">${escapeHtml(line.trim())}</span>`);

        return `<p class="editor-paragraph">${paragraphLines.join('<br>')}</p>`;
    }).join('');

    lines.lexical.root.children = paragraphs.map((paragraph) => createParagraphNode(
        paragraph
            .split('\n')
            .map((line) => line.trim())
            .join('\n')
    ));

    return lines;
}
