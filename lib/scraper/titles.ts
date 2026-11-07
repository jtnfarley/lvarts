export type CleanedTitle = {
	headline: string;
	tagline: string | null;
	soldOut: boolean;
	canceled: boolean;
	notices: string[];
};

const collapse = (text: string): string => text.replace(/\s+/g, ' ').trim();

// Notices look like "• SOLD OUT! WAITLIST OPEN• Title" or "• LOW TICKET ALERT! • Title".
// A notice with no closing bullet runs to the end of the title.
const LEADING_NOTICE = /^\s*•\s*([^•]*?)\s*(?:•|$)/;

const splitNotices = (rawTitle: string): { notices: string[]; rest: string } => {
	const notices: string[] = [];
	let rest = rawTitle;
	for (let match = LEADING_NOTICE.exec(rest); match; match = LEADING_NOTICE.exec(rest)) {
		const notice = collapse(match[1]);
		if (notice) notices.push(notice);
		rest = rest.slice(match[0].length);
	}
	return { notices, rest };
};

// First en dash, or first hyphen that has spaces around it.
const DASH = /–| - /;

export const cleanTitle = (rawTitle: string): CleanedTitle => {
	const { notices, rest } = splitNotices(rawTitle);
	const noticeText = notices.join(' ');
	const soldOut = /sold\s*out/i.test(noticeText);
	const canceled = /cancell?ed/i.test(noticeText);

	// A title that is only a notice (e.g. "• DEC. 6 Open Mike Night IS CANCELED ...") keeps its text as the headline.
	const title = collapse(rest) || collapse(rawTitle.replace(/•/g, ' '));
	const dash = DASH.exec(title);
	if (!dash) return { headline: title, tagline: null, soldOut, canceled, notices };

	const headline = collapse(title.slice(0, dash.index));
	const tagline = collapse(title.slice(dash.index + dash[0].length));
	return { headline: headline || title, tagline: tagline || null, soldOut, canceled, notices };
};
