import type { ScrapedEvent } from '../scraper/types';

export const SOURCE_LINK_LABEL = 'More info and tickets: ';
export const SOLD_OUT_LINE = 'Sold out';

export type PostContent = { content: string; lexical: string };

const escapeHtml = (text: string): string =>
	text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The post renderer treats [square brackets] as template tags.
const withoutBrackets = (text: string): string => text.replace(/\[/g, '(').replace(/\]/g, ')');

const textNode = (text: string) => ({ detail: 0, format: 0, mode: 'normal', style: '', text, type: 'text', version: 1 });

const paragraphNode = (children: object[]) => ({
	children,
	direction: null,
	format: '',
	indent: 0,
	type: 'paragraph',
	version: 1,
	textFormat: 0,
	textStyle: '',
});

const autoLinkNode = (url: string) => ({
	children: [textNode(url)],
	direction: null,
	format: '',
	indent: 0,
	type: 'autolink',
	version: 1,
	rel: null,
	target: '_blank',
	title: null,
	url,
	isUnlinked: false,
});

const textParagraphHtml = (text: string): string =>
	`<p class="editor-paragraph"><span style="white-space: pre-wrap;">${escapeHtml(text)}</span></p>`;

// Same HTML and lexical shapes the post editor produces.
export const buildPostContent = (event: ScrapedEvent): PostContent => {
	const lines = [event.tagline, event.description, event.soldOut ? SOLD_OUT_LINE : null]
		.filter((line): line is string => Boolean(line))
		.map(withoutBrackets);

	const linkHtml =
		`<p class="editor-paragraph"><span style="white-space: pre-wrap;">${SOURCE_LINK_LABEL}</span>` +
		`<a href="${escapeHtml(event.sourceUrl)}" target="_blank" class="editor-link">` +
		`<span style="white-space: pre-wrap;">${escapeHtml(event.sourceUrl)}</span></a></p>`;

	const paragraphs = [
		...lines.map((line) => paragraphNode([textNode(line)])),
		paragraphNode([textNode(SOURCE_LINK_LABEL), autoLinkNode(event.sourceUrl)]),
	];
	const lexical = {
		root: { children: paragraphs, direction: null, format: '', indent: 0, type: 'root', version: 1 },
	};

	return { content: lines.map(textParagraphHtml).join('') + linkHtml, lexical: JSON.stringify(lexical) };
};

const unescapeHtml = (text: string): string =>
	text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#0?39;/g, "'").replace(/&amp;/g, '&');

// The source link line is how the importer recognizes its own posts. The link may have been re-saved
// by the editor, so look at the last "More info and tickets:" label and take the first link after it.
export const extractSourceUrl = (content: string | null): string | null => {
	if (!content) return null;
	const labelStart = content.lastIndexOf(SOURCE_LINK_LABEL.trim());
	if (labelStart === -1) return null;

	const afterLabel = content.slice(labelStart);
	const href = /href="([^"]+)"/.exec(afterLabel)?.[1];
	if (href) return unescapeHtml(href);
	return /https?:\/\/[^\s<"]+/.exec(afterLabel)?.[0] ?? null;
};

export const hasSoldOutLine = (content: string | null): boolean =>
	Boolean(content?.includes(`>${SOLD_OUT_LINE}</span>`));
