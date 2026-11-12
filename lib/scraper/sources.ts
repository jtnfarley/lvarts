import { djBradScottAdapter } from './adapters/djbradscott';
import { godfreyAdapter } from './adapters/godfrey';
import { inkwellAdapter } from './adapters/inkwell';
import type { SourceAdapter } from './types';

export type Source = {
	key: string;
	displayName: string;
	// Unset for sources whose events happen at many venues.
	venueName?: string;
	adapter: SourceAdapter;
};

export const SOURCES: Source[] = [
	{ key: 'godfrey', displayName: 'Godfrey Daniels', venueName: 'Godfrey Daniels', adapter: godfreyAdapter },
	{ key: 'inkwell', displayName: 'Inkwell.', venueName: 'Inkwell.', adapter: inkwellAdapter },
	{ key: 'djbradscott', displayName: 'DJ Brad Scott', adapter: djBradScottAdapter },
];
