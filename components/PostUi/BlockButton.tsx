'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { blockUser } from '@/app/actions/blocks';

export default function BlockButton(props: { userdetailsid: number; handle?: string | null; isBlocked?: boolean }) {
	const { userdetailsid, handle, isBlocked } = props;
	const [step, setStep] = useState<'idle' | 'confirming' | 'blocked'>(isBlocked ? 'blocked' : 'idle');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const block = async () => {
		setIsSubmitting(true);
		setError(undefined);
		try {
			const result = await blockUser({ userdetailsid });
			if (result.ok) setStep('blocked');
			else setError(result.error);
		} catch (blockError) {
			console.error('Block failed', blockError);
			setError('We could not block this user. Please try again.');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (step === 'blocked') {
		return (
			<p className="mt-2 text-xs text-lvartsmusic-muted">
				Blocked. You can undo this in{' '}
				<Link href="/settings" className="text-lvartsmusic-accent underline">
					Settings
				</Link>
				.
			</p>
		);
	}

	if (step === 'confirming') {
		return (
			<div className="mt-2 flex flex-col items-center gap-2 text-xs">
				<p className="text-lvartsmusic-muted">
					Block {handle ? `@${handle}` : 'this user'}? You won&apos;t see their posts or notifications from them.
				</p>
				{error && <p className="text-rose-500">{error}</p>}
				<div className="flex gap-2">
					<Button type="button" className="cursor-pointer rounded-full bg-transparent px-3 py-1 text-xs shadow-none hover:bg-transparent" onClick={() => setStep('idle')} disabled={isSubmitting}>
						Cancel
					</Button>
					<Button type="button" className="cursor-pointer rounded-full bg-rose-600 px-3 py-1 text-xs text-white hover:bg-rose-700 disabled:opacity-50" onClick={block} disabled={isSubmitting}>
						Block
					</Button>
				</div>
			</div>
		);
	}

	return (
		<button
			type="button"
			onClick={() => setStep('confirming')}
			className="mt-2 text-xs text-lvartsmusic-muted underline hover:text-rose-500"
		>
			Block this user
		</button>
	);
}
