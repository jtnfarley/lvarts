'use client'

import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import createDOMPurify from 'dompurify';

// The stored HTML comes from the author's browser, so it is sanitized before it is shown,
// the same way PostContent does it.
export default function ZineBody({ html }: { html: string }) {
	const [cleanHtml, setCleanHtml] = useState('');

	useEffect(() => {
		setCleanHtml(createDOMPurify(window).sanitize(html));
	}, [html]);

	return <div className="zine-body flex flex-col gap-4 text-lg leading-relaxed">{parse(cleanHtml)}</div>;
}
