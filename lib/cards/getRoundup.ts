import { CardEvent, getCardEventsBetween } from './getCardEvent';
import { cleanCoverTitle } from './text';
import { resolveWindow, RoundupOptions, RoundupWindow } from './roundupWindow';

export type SkippedEvent = { id: number; title?: string; reason: string };

export type Roundup = RoundupWindow & {
	events: CardEvent[];
	skipped: SkippedEvent[];
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

	return { ...window, headline: cleanCoverTitle(options.title) ?? window.headline, events: renderable, skipped };
};
