import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { MAX_POST_IMAGES, parsePostFiles } from './postImages';

describe('parsePostFiles', () => {
	it('makes the first file the cover and the rest extras, in order', () => {
		assert.deepEqual(parsePostFiles(['a.webp', 'b.webp', 'c.webp']), { cover: 'a.webp', extras: ['b.webp', 'c.webp'] });
	});

	it('accepts an empty list as "no images"', () => {
		assert.deepEqual(parsePostFiles([]), { cover: null, extras: [] });
	});

	it('rejects more than the maximum', () => {
		const tooMany = Array.from({ length: MAX_POST_IMAGES + 1 }, (_, index) => `${index}.webp`);
		assert.throws(() => parsePostFiles(tooMany));
	});

	it('rejects path separators, traversal and non-strings', () => {
		assert.throws(() => parsePostFiles(['../x.webp']));
		assert.throws(() => parsePostFiles(['a/b.webp']));
		assert.throws(() => parsePostFiles(['a\\b.webp']));
		assert.throws(() => parsePostFiles([42]));
		assert.throws(() => parsePostFiles('a.webp'));
	});

	it('rejects duplicates', () => {
		assert.throws(() => parsePostFiles(['a.webp', 'a.webp']));
	});
});
