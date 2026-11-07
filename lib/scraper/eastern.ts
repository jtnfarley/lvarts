import { easternParts, easternWallTimeToDate } from '@/lib/cards/text';

const pad = (value: number): string => String(value).padStart(2, '0');

export const easternDate = (date: Date): string => {
	const { year, month, day } = easternParts(date);
	return `${year}-${pad(month)}-${pad(day)}`;
};

// e.g. 2026-11-06T20:00:00-05:00
export const toEasternIso = (date: Date): string => {
	const parts = easternParts(date);
	const wallAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
	const offsetMinutes = Math.round((wallAsUtc - date.getTime()) / 60000);
	const sign = offsetMinutes < 0 ? '-' : '+';
	const absolute = Math.abs(offsetMinutes);
	const offset = `${sign}${pad(Math.floor(absolute / 60))}:${pad(absolute % 60)}`;
	const wall = `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}:${pad(parts.second)}`;
	return wall + offset;
};

export { easternWallTimeToDate };
