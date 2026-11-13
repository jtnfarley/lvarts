import * as cheerio from 'cheerio';
import { easternWallTimeToDate } from '../eastern';
import type { EventDetail, ListingItem, ScrapedVenue, SourceAdapter } from '../types';
import { trimDescription } from './godfrey';

const SEASON_URL = 'https://touchstone.org/season/';
const MIN_PARAGRAPH_LENGTH = 20;

// The footer of every page states the theater's own address; other venues give theirs on the event page.
const TOUCHSTONE_THEATRE: ScrapedVenue = {
	name: 'Touchstone Theatre',
	address: '321 East 4th St',
	city: 'Bethlehem',
	state: 'PA',
	zip: '18015',
};

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

const MONTH = '(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)';
const WEEKDAY = '(mon|tues?|wed(?:nes)?|thu(?:rs)?|fri|sat(?:ur)?|sun)days?';
const TIME = '\\d{1,2}(?::\\d{2})?(?:\\s*[-–]\\s*\\d{1,2}(?::\\d{2})?)?\\s*(?:am|pm)';

// "Sat, Dec 12 & 19, 2026", "Oct 7-10, 2026", "September 25". Groups: weekday, month, day, range end, extra day, year.
const DATE = new RegExp(`(?:${WEEKDAY},?\\s+)?\\b${MONTH}\\.?\\s+(\\d{1,2})(?:\\s*[-–]\\s*(\\d{1,2})|\\s*&\\s*(\\d{1,2})(?!\\s*[a-z]))?(?:,?\\s*(20\\d{2}))?`, 'gi');
// A date or weekday list, then "@", then one or more times: "Thursdays - Saturdays @ 8pm" or "Oct 3 @ 2pm & 8pm".
const SEGMENT = new RegExp(`([^@]*)@\\s*(${TIME}(?:\\s*&\\s*${TIME})*)`, 'gi');
const TIME_PART = new RegExp(`(\\d{1,2})(?::(\\d{2}))?(?:\\s*[-–]\\s*\\d{1,2}(?::\\d{2})?)?\\s*(am|pm)`, 'gi');
const WEEKDAY_RANGE = new RegExp(`${WEEKDAY}(?:\\s*[-–]\\s*${WEEKDAY})?`, 'gi');

type Time = { hour: number; minute: number };
type Day = { year: number; month: number; day: number };
type Showtime = Day & Time;

const weekdayIndex = (name: string): number => WEEKDAYS.indexOf(name.slice(0, 3).toLowerCase());
const monthNumber = (name: string): number => MONTHS.indexOf(name.slice(0, 3).toLowerCase()) + 1;

const weekdayOf = ({ year, month, day }: Day): number => new Date(Date.UTC(year, month - 1, day)).getUTCDay();

const parseTimes = (text: string): Time[] =>
	[...text.matchAll(TIME_PART)].map((match) => ({
		hour: (Number(match[1]) % 12) + (match[3].toLowerCase() === 'pm' ? 12 : 0),
		minute: Number(match[2] ?? 0),
	}));

// The page rarely gives a year, so fall back to the one weekday-and-date combination that exists nearby.
const resolveYear = (month: number, day: number, weekday: string | undefined, explicit: string | undefined, fallback: number | null, now: Date): number | null => {
	if (explicit) return Number(explicit);
	if (fallback) return fallback;
	if (!weekday) return null;

	const wanted = weekdayIndex(weekday);
	const thisYear = now.getUTCFullYear();
	return [thisYear, thisYear + 1, thisYear - 1].find((year) => weekdayOf({ year, month, day }) === wanted) ?? null;
};

// Every day named by the dates in `text`, expanding "7-10" ranges.
const parseDays = (text: string, fallbackYear: number | null, now: Date): Day[] => {
	const days: Day[] = [];
	for (const match of text.matchAll(DATE)) {
		const [, weekday, monthName, startText, endText, extraText, yearText] = match;
		const month = monthNumber(monthName);
		const start = Number(startText);
		const year = resolveYear(month, start, weekday, yearText, fallbackYear, now);
		if (!year) throw new Error(`cannot tell the year of "${match[0].trim()}"`);

		if (extraText) days.push({ year, month, day: start }, { year, month, day: Number(extraText) });
		else for (let day = start; day <= Number(endText ?? start); day += 1) days.push({ year, month, day });
	}
	return days;
};

const weekdaysIn = (text: string): Set<number> => {
	const weekdays = new Set<number>();
	for (const match of text.matchAll(WEEKDAY_RANGE)) {
		const first = weekdayIndex(match[1]);
		const last = match[2] ? weekdayIndex(match[2]) : first;
		for (let weekday = first; ; weekday = (weekday + 1) % 7) {
			weekdays.add(weekday);
			if (weekday === last) break;
		}
	}
	return weekdays;
};

// One showtime per day, the earliest: the importer makes one event per day.
export const parseShowtimes = (scheduleText: string, leadText: string, now: Date): Showtime[] => {
	const leadYear = /\b(20\d{2})\b/.exec(leadText)?.[1];
	const fallbackYear = leadYear ? Number(leadYear) : null;
	const leadDays = parseDays(leadText, fallbackYear, now);
	const showtimes: Showtime[] = [];

	for (const [, left, timesText] of scheduleText.matchAll(SEGMENT)) {
		const times = parseTimes(timesText);
		if (left.search(DATE) >= 0) {
			for (const day of parseDays(left, fallbackYear, now)) showtimes.push(...times.map((time) => ({ ...day, ...time })));
			continue;
		}

		const weekdays = weekdaysIn(left);
		for (const day of leadDays.filter((leadDay) => weekdays.has(weekdayOf(leadDay)))) {
			showtimes.push(...times.map((time) => ({ ...day, ...time })));
		}
	}

	const earliest = new Map<string, Showtime>();
	for (const showtime of showtimes) {
		const key = `${showtime.year}-${showtime.month}-${showtime.day}`;
		const known = earliest.get(key);
		if (!known || showtime.hour * 60 + showtime.minute < known.hour * 60 + known.minute) earliest.set(key, showtime);
	}
	return [...earliest.values()].sort(
		(a, b) => Date.UTC(a.year, a.month - 1, a.day, a.hour, a.minute) - Date.UTC(b.year, b.month - 1, b.day, b.hour, b.minute),
	);
};

const lines = (text: string): string[] =>
	text
		.split(/\r?\n/)
		.map((line) => line.replace(/\s+/g, ' ').trim())
		.filter(Boolean);

export const parseVenue = (venueLines: string[]): ScrapedVenue | null => {
	// Some pages put a Spanish translation of the date line before the venue, or leave only that line.
	const [name, addressLine] = venueLines.filter((line) => !/\ba las\b/i.test(line));
	if (!name || /^(featuring|theme):/i.test(name)) return null;
	if (name === TOUCHSTONE_THEATRE.name) return TOUCHSTONE_THEATRE;

	const address = /^(.+?),\s*([^,]+),\s*([A-Z]{2})(?:\s+(\d{5}))?$/.exec(addressLine ?? '');
	if (!address) return { name };
	return { name, address: address[1], city: address[2], state: address[3], ...(address[4] ? { zip: address[4] } : {}) };
};

export type TouchstoneEvent = {
	title: string;
	showtimes: Showtime[];
	detail: EventDetail;
};

// Throws when the page has no showtime we can read, so the caller can skip that event and say why.
export const parseEventPage = (html: string, now: Date): TouchstoneEvent => {
	const $ = cheerio.load(html);
	// Dates, times, and venue are separated by <br>.
	$('br').replaceWith('\n');

	const title = $('h3.ticket-info').first().text().replace(/\s+/g, ' ').trim() || $('meta[property="og:title"]').attr('content')?.trim() || '';
	if (!title) throw new Error('no title');

	const boldLines = lines($('#single-events p:has(> b)').first().text());
	// "SEPT 17-19, 2026 - A limited-run production…": the dates are what comes before the dash.
	const leadText = (boldLines[0] ?? '').split(/\s[-–]\s/)[0];
	const ticketInfo = $('p.ticket-info')
		.toArray()
		.map((element) => lines($(element).text()))
		.find((infoLines) => infoLines[0]?.includes('@'));

	// Most pages put the schedule in the ticket info; Christmas City Follies puts it under the dates at the top.
	const scheduleText = [ticketInfo?.[0], boldLines.slice(1).join('\n'), leadText].find((text) => text?.includes('@'));
	if (!scheduleText) throw new Error('no showtime on the page');

	const showtimes = parseShowtimes(scheduleText, leadText, now);
	if (showtimes.length === 0) throw new Error('no dates found in the schedule');

	const venueLines = ticketInfo ? ticketInfo.slice(1) : lines($('p.important-info').first().text());
	const description =
		$('meta[property="og:description"]').attr('content')?.replace(/\s+/g, ' ').trim() ||
		$('.single-events-details p')
			.toArray()
			.map((element) => $(element).text().replace(/\s+/g, ' ').trim())
			.find((text) => text.length >= MIN_PARAGRAPH_LENGTH) ||
		null;

	return {
		title,
		showtimes,
		detail: {
			startsAt: null,
			imageUrl: $('meta[property="og:image"]').attr('content')?.trim() || null,
			description: description ? trimDescription(description) : null,
			venue: parseVenue(venueLines),
		},
	};
};

export const eventLinks = (seasonHtml: string): string[] => {
	const $ = cheerio.load(seasonHtml);
	const urls = new Set<string>();
	$('a[href*="/events/"]').each((_, link) => {
		const url = new URL($(link).attr('href') ?? '', SEASON_URL);
		if (url.hostname === 'touchstone.org' && /^\/events\/[^/]+\/?$/.test(url.pathname)) urls.add(url.href);
	});
	return [...urls];
};

export const createTouchstoneAdapter = (now: () => Date = () => new Date()): SourceAdapter => {
	// The dates only exist on the event pages, so the listing reads them all and fetchDetail answers from here.
	const detailsByUrl = new Map<string, EventDetail>();

	return {
		detailsInListing: true,

		fetchListing: async (getHtml, report) => {
			detailsByUrl.clear();
			const items: ListingItem[] = [];

			for (const sourceUrl of eventLinks(await getHtml(SEASON_URL))) {
				try {
					const event = parseEventPage(await getHtml(sourceUrl), now());
					detailsByUrl.set(sourceUrl, event.detail);
					for (const { year, month, day, hour, minute } of event.showtimes) {
						items.push({ sourceUrl, rawTitle: event.title, startsAt: easternWallTimeToDate(year, month, day, hour, minute) });
					}
				} catch (error) {
					report(`skipped ${sourceUrl}: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
			return items;
		},

		fetchDetail: async (url) => {
			const detail = detailsByUrl.get(url);
			if (!detail) throw new Error(`touchstone: no listing data for ${url}`);
			return detail;
		},
	};
};

export const touchstoneAdapter = createTouchstoneAdapter();
