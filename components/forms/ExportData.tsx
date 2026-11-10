'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { emailMyDataExport } from '@/app/actions/dataExport';

export default function ExportData() {
	const [isSending, setIsSending] = useState(false);
	const [sentTo, setSentTo] = useState<string | undefined>();
	const [error, setError] = useState<string | undefined>();

	const send = async () => {
		setIsSending(true);
		setError(undefined);
		try {
			const result = await emailMyDataExport();
			if (result.ok) setSentTo(result.email);
			else setError(result.error);
		} catch (sendError) {
			console.error('Requesting data export failed', sendError);
			setError('We could not send the email. Please try again later.');
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="mt-3">
			{error && <p className="mb-2 text-sm text-rose-500">{error}</p>}
			{sentTo && <p className="mb-2 text-sm">We emailed a download link to {sentTo}. It works for one hour.</p>}
			<Button
				type="button"
				className="cursor-pointer rounded-full bg-orange px-3.5 py-1.5 text-sm text-white disabled:opacity-50"
				onClick={send}
				disabled={isSending}
			>
				{sentTo ? 'Send it again' : 'Email me my data'}
			</Button>
		</div>
	);
}
