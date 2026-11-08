'use client'

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { BiFlag } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { reportContent } from '@/app/actions/reports';
import { REPORT_REASONS, type ReportReason } from '@/lib/reports';

type Target = { postid: number } | { userdetailsid: number };

export default function ReportButton(props: { target: Target; variant: 'icon' | 'text' }) {
	const { target, variant } = props;
	const [isOpen, setIsOpen] = useState(false);
	const [reason, setReason] = useState<ReportReason | undefined>();
	const [details, setDetails] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const close = () => {
		setIsOpen(false);
		setReason(undefined);
		setDetails('');
		setIsSent(false);
		setError(undefined);
	};

	useEffect(() => {
		if (!isOpen) return;
		const closeOnEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape') close();
		};
		window.addEventListener('keydown', closeOnEscape);
		return () => window.removeEventListener('keydown', closeOnEscape);
	}, [isOpen]);

	const submit = async () => {
		if (!reason || isSubmitting) return;
		setIsSubmitting(true);
		setError(undefined);
		try {
			const result = await reportContent({ ...target, reason, details: details || undefined });
			if (result.ok) setIsSent(true);
			else setError(result.error);
		} catch (submitError) {
			console.error('Report failed', submitError);
			setError('We could not send your report. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Rendered in a portal so a card's overflow or transform can't clip the overlay.
	const dialog = isOpen && createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={close}>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="report-title"
				className="lvartsmusic-card w-full max-w-md p-5"
				onClick={(event) => event.stopPropagation()}
			>
				{isSent ? (
					<div className="flex flex-col gap-4">
						<h2 id="report-title" className="text-lg font-semibold">Thanks for letting us know</h2>
						<p className="text-sm text-lvartsmusic-muted">We&apos;ll review your report.</p>
						<Button type="button" className="cursor-pointer self-end rounded-full bg-orange px-3.5 py-1.5 text-sm text-white" onClick={close}>
							Close
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-3">
						<h2 id="report-title" className="text-lg font-semibold">Report</h2>
						<fieldset className="flex flex-col gap-2">
							<legend className="mb-1 text-sm text-lvartsmusic-muted">Why are you reporting this?</legend>
							{(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
								<label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
									<input type="radio" name="report-reason" checked={reason === key} onChange={() => setReason(key)} />
									{REPORT_REASONS[key]}
								</label>
							))}
						</fieldset>
						<Textarea
							value={details}
							onChange={(event) => setDetails(event.target.value)}
							maxLength={500}
							placeholder="Anything else we should know? (optional)"
							disabled={isSubmitting}
						/>
						{error && <p className="text-sm text-rose-500">{error}</p>}
						<div className="flex justify-end gap-2">
							<Button type="button" className="cursor-pointer rounded-full bg-transparent px-3.5 py-1.5 text-sm shadow-none hover:bg-transparent" onClick={close} disabled={isSubmitting}>
								Cancel
							</Button>
							<Button type="button" className="cursor-pointer rounded-full bg-orange px-3.5 py-1.5 text-sm text-white disabled:opacity-50" onClick={submit} disabled={!reason || isSubmitting}>
								Send report
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>,
		document.body
	);

	return (
		<>
			{variant === 'icon' ? (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					title="Report"
					aria-label="Report"
					className="rounded-full p-2 text-lvartsmusic-muted transition-colors hover:bg-rose-500/10 hover:text-rose-500"
				>
					<BiFlag className="h-4.5 w-4.5" />
				</button>
			) : (
				<button
					type="button"
					onClick={() => setIsOpen(true)}
					className="mt-3 text-xs text-lvartsmusic-muted underline hover:text-rose-500"
				>
					Report this profile
				</button>
			)}
			{dialog}
		</>
	);
}
