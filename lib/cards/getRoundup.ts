import { CardEvent, getCardEventsBetween } from './getCardEvent';
import { resolveWindow, RoundupOptions, RoundupWindow } from './roundupWindow';
import { theme } from './theme';

export type SkippedEvent = { id: number; title?: string; reason: string };

export type Roundup = RoundupWindow & {
	events: CardEvent[];
	skipped: SkippedEvent[];
	// Events that qualified but didn't fit in the carousel.
	moreCount: number;
};

export const getRoundup = async (options: RoundupOptions): Promise<Roundup> => {
	const window = resolveWindow(options);
	const results = await getCardEventsBetween(window.startsAt, window.endsAt);

	const renderable: CardEvent[] = [];
	const skipped: SkippedEvent[] = [];
	for (const result of results) {
		if (result.ok) renderable.push(result.event);
		else skipped.push({ id: result.id, title: result.title, reason: result.reason });
	}

	const events = renderable.slice(0, theme.maxRoundupEvents);
	for (const event of renderable.slice(theme.maxRoundupEvents)) {
		skipped.push({ id: event.id, title: event.title, reason: `over the limit of ${theme.maxRoundupEvents}` });
	}

	return { ...window, events, skipped, moreCount: renderable.length - events.length };
};
