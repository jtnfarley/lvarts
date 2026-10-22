import { easternParts, easternWallTimeToDate } from './text';

export type RoundupOptions = {
	preset?: 'today' | 'weekend';
	date?: string;
	start?: string;
	end?: string;
};

export type RoundupKind = 'daily' | 'weekend' | 'custom';

export type RoundupWindow = {
	kind: RoundupKind;
	// Inclusive start, exclusive end (the next Eastern midnight).
	startsAt: Date;
	endsAt: Date;
	headline: string;
	dateLabel: string;
};

export class InvalidRoundupInput extends Error {}

export type CalendarDay = { year: number; month: number; day: number };

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export const parseDay = (value: string): CalendarDay => {
	const match = DATE_PATTERN.exec(value);
	if (!match) throw new InvalidRoundupInput(`Invalid date "${value}", expected YYYY-MM-DD`);
	const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
	const check = new Date(Date.UTC(year, month - 1, day));
	if (check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
		throw new InvalidRoundupInput(`Invalid date "${value}"`);
	}
	return { year, month, day };
};

export const formatDay = ({ year, month, day }: CalendarDay): string =>
	`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export const addDays = (value: CalendarDay, days: number): CalendarDay => {
	const shifted = new Date(Date.UTC(value.year, value.month - 1, value.day + days));
	return { year: shifted.getUTCFullYear(), month: shifted.getUTCMonth() + 1, day: shifted.getUTCDate() };
};

export const easternToday = (now: Date = new Date()): CalendarDay => {
	const { year, month, day } = easternParts(now);
	return { year, month, day };
};

const dayOfWeek = ({ year, month, day }: CalendarDay): number => new Date(Date.UTC(year, month - 1, day)).getUTCDay();

const midnight = ({ year, month, day }: CalendarDay): Date => easternWallTimeToDate(year, month, day);

const shortDay = (value: CalendarDay): string => `${MONTHS[value.month - 1]} ${value.day}`;

const rangeLabel = (first: CalendarDay, last: CalendarDay): string => {
	if (first.month === last.month) return `${MONTHS[first.month - 1]} ${first.day}–${last.day}`;
	return `${shortDay(first)}–${shortDay(last)}`;
};

const dailyWindow = (day: CalendarDay): RoundupWindow => ({
	kind: 'daily',
	startsAt: midnight(day),
	endsAt: midnight(addDays(day, 1)),
	headline: "What's Happening Today",
	dateLabel: `${WEEKDAYS[dayOfWeek(day)]} ${shortDay(day)}`,
});

// Mon–Thu look ahead to the coming weekend; Fri–Sun use the current one.
const weekendWindow = (reference: CalendarDay): RoundupWindow => {
	const weekday = dayOfWeek(reference);
	const friday = addDays(reference, weekday >= 1 && weekday <= 4 ? 5 - weekday : weekday === 5 ? 0 : weekday === 6 ? -1 : -2);
	const sunday = addDays(friday, 2);
	return {
		kind: 'weekend',
		startsAt: midnight(friday),
		endsAt: midnight(addDays(sunday, 1)),
		headline: 'This Weekend in the Valley',
		dateLabel: rangeLabel(friday, sunday),
	};
};

const customWindow = (first: CalendarDay, last: CalendarDay): RoundupWindow => {
	const startsAt = midnight(first);
	const endsAt = midnight(addDays(last, 1));
	if (endsAt <= startsAt) throw new InvalidRoundupInput('End date must not be before start date');
	return {
		kind: 'custom',
		startsAt,
		endsAt,
		headline: 'Coming Up in the Valley',
		dateLabel: formatDay(first) === formatDay(last) ? shortDay(first) : rangeLabel(first, last),
	};
};

// Adding a preset (e.g. "This Week") means adding a case here.
export const resolveWindow = (options: RoundupOptions, now: Date = new Date()): RoundupWindow => {
	if (options.start || options.end) {
		if (!options.start || !options.end) throw new InvalidRoundupInput('Both start and end are required');
		return customWindow(parseDay(options.start), parseDay(options.end));
	}

	const reference = options.date ? parseDay(options.date) : easternToday(now);
	switch (options.preset) {
		case 'today':
			return dailyWindow(reference);
		case 'weekend':
			return weekendWindow(reference);
		default:
			throw new InvalidRoundupInput('Provide preset=today|weekend or start and end dates');
	}
};
