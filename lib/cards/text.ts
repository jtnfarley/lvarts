const EASTERN = 'America/New_York';

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	lt: '<',
	gt: '>',
	quot: '"',
	apos: "'",
	nbsp: ' ',
	ndash: '–',
	mdash: '—',
	rsquo: '’',
	lsquo: '‘',
	rdquo: '”',
	ldquo: '“',
};

export const collapseWhitespace = (text: string): string => text.replace(/\s+/g, ' ').trim();

export const stripHtml = (html: string): string => {
	const withoutTags = html.replace(/<(br|\/p|\/div|\/li)\s*\/?>/gi, ' ').replace(/<[^>]*>/g, '');
	const decoded = withoutTags.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity: string) => {
		if (entity.startsWith('#')) {
			const isHex = entity[1].toLowerCase() === 'x';
			const codePoint = parseInt(entity.slice(isHex ? 2 : 1), isHex ? 16 : 10);
			return Number.isNaN(codePoint) ? match : String.fromCodePoint(codePoint);
		}
		return NAMED_ENTITIES[entity.toLowerCase()] ?? match;
	});
	return collapseWhitespace(decoded);
};

// The card fonts have no emoji glyphs, which would render as boxes.
export const stripEmoji = (text: string): string =>
	collapseWhitespace(text.replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}\p{Regional_Indicator}‍️⃣]/gu, ''));

export const cleanText = (text: string): string => stripEmoji(stripHtml(text));

// Cuts at a word boundary when one exists in the last 40% of the allowed length.
export const truncate = (text: string, maxLength: number): string => {
	if (text.length <= maxLength) return text;
	const cut = text.slice(0, maxLength - 1);
	const lastSpace = cut.lastIndexOf(' ');
	const atWord = lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut;
	return `${atWord.replace(/[\s,.;:–—-]+$/, '')}…`;
};

export const TITLE_TRUNCATE_AT = 100;
export const SNIPPET_LENGTH = 140;
export const VENUE_LENGTH = 40;

type TitleStyle = { text: string; fontSize: number };

const TITLE_TIERS = [
	{ maxLength: 30, withImage: 72, withoutImage: 104 },
	{ maxLength: 60, withImage: 58, withoutImage: 84 },
	{ maxLength: Infinity, withImage: 48, withoutImage: 68 },
];

// Satori can't measure text, so size is picked from the character count.
export const titleStyle = (title: string, hasImage: boolean): TitleStyle => {
	const tier = TITLE_TIERS.find((candidate) => title.length <= candidate.maxLength) ?? TITLE_TIERS[2];
	const text = title.length > 90 ? truncate(title, TITLE_TRUNCATE_AT) : title;
	return { text, fontSize: hasImage ? tier.withImage : tier.withoutImage };
};

type EasternParts = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	second: number;
	weekday: string;
	monthName: string;
};

const easternFormatter = new Intl.DateTimeFormat('en-US', {
	timeZone: EASTERN,
	year: 'numeric',
	month: 'numeric',
	day: 'numeric',
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	hourCycle: 'h23',
	weekday: 'short',
});

const monthNameFormatter = new Intl.DateTimeFormat('en-US', { timeZone: EASTERN, month: 'short' });

export const easternParts = (date: Date): EasternParts => {
	const parts = Object.fromEntries(easternFormatter.formatToParts(date).map((part) => [part.type, part.value]));
	return {
		year: Number(parts.year),
		month: Number(parts.month),
		day: Number(parts.day),
		hour: Number(parts.hour),
		minute: Number(parts.minute),
		second: Number(parts.second),
		weekday: parts.weekday.toUpperCase(),
		monthName: monthNameFormatter.format(date).toUpperCase(),
	};
};

const offsetAt = (timestamp: number): number => {
	const parts = easternParts(new Date(timestamp));
	const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
	return wallAsUtc - Math.floor(timestamp / 1000) * 1000;
};

// Converts an Eastern wall-clock time to the matching UTC instant, DST-aware.
export const easternWallTimeToDate = (year: number, month: number, day: number, hour = 0, minute = 0): Date => {
	const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);
	const firstGuess = wallAsUtc - offsetAt(wallAsUtc);
	return new Date(wallAsUtc - offsetAt(firstGuess));
};

export const isDateOnly = (date: Date): boolean => {
	const parts = easternParts(date);
	return parts.hour === 0 && parts.minute === 0;
};

// e.g. "FRI OCT 24 · 8:00 PM", or "FRI OCT 24" when no time was entered.
export const formatDateLine = (date: Date | null): string => {
	if (!date) return 'DATE TBA';
	const parts = easternParts(date);
	const day = `${parts.weekday} ${parts.monthName} ${parts.day}`;
	if (isDateOnly(date)) return day;
	const hour12 = parts.hour % 12 === 0 ? 12 : parts.hour % 12;
	const suffix = parts.hour < 12 ? 'AM' : 'PM';
	return `${day} · ${hour12}:${String(parts.minute).padStart(2, '0')} ${suffix}`;
};
