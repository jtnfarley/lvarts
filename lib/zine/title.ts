import { stripHtml, truncate } from '@/lib/cards/text';

const MAX_TITLE_LENGTH = 100;

const FIRST_BLOCK = /^\s*<(p|h[1-6]|div)\b[^>]*>([\s\S]*?)<\/\1>/i;

type ZineText = { title: string; bodyHtml: string };

// Zine posts have no title field: the first line of the post is the title (usually bold).
// A first line that is really a paragraph stays in the body, so no text is lost.
export const splitTitle = (html: string): ZineText => {
	const block = FIRST_BLOCK.exec(html);
	const firstLine = stripHtml(block?.[2] ?? html);

	if (!block || firstLine.length > MAX_TITLE_LENGTH) {
		return { title: truncate(firstLine, MAX_TITLE_LENGTH), bodyHtml: html };
	}

	return { title: firstLine, bodyHtml: html.slice(block[0].length) };
};
