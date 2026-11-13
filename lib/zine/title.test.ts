import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitTitle } from './title';

describe('splitTitle', () => {
	it('uses a bold first paragraph as the title and leaves the rest as the body', () => {
		const html = '<p dir="ltr"><b><strong style="white-space: pre-wrap;">Night Bus</strong></b></p><p>It was late.</p>';
		assert.deepEqual(splitTitle(html), { title: 'Night Bus', bodyHtml: '<p>It was late.</p>' });
	});

	it('uses a plain first paragraph as the title too', () => {
		assert.deepEqual(splitTitle('<p>Night Bus</p><p>It was late.</p>'), { title: 'Night Bus', bodyHtml: '<p>It was late.</p>' });
	});

	it('decodes entities in the title', () => {
		assert.equal(splitTitle('<p>Rock &amp; Roll</p>').title, 'Rock & Roll');
	});

	it('keeps a long first paragraph in the body and shortens the title', () => {
		const html = `<p>${'word '.repeat(60)}</p><p>More.</p>`;
		const { title, bodyHtml } = splitTitle(html);
		assert.ok(title.length <= 100);
		assert.equal(bodyHtml, html);
	});

	it('handles content with no block tags', () => {
		assert.deepEqual(splitTitle('Just text'), { title: 'Just text', bodyHtml: 'Just text' });
	});
});
