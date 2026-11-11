import { godfreyAdapter } from './adapters/godfrey';
import { inkwellAdapter } from './adapters/inkwell';
import type { SourceAdapter } from './types';

export type Source = {
	key: string;
	displayName: string;
	venueName: string;
	adapter: SourceAdapter;
};

export const SOURCES: Source[] = [
	{ key: 'godfrey', displayName: 'Godfrey Daniels', venueName: 'Godfrey Daniels', adapter: godfreyAdapter },
	{ key: 'inkwell', displayName: 'Inkwell.', venueName: 'Inkwell.', adapter: inkwellAdapter },
];
