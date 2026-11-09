'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import imageUrl from '@/constants/imageUrl';
import Avatar from '@/components/shared/Avatar';
import { Button } from '@/components/ui/button';
import { unblockUser } from '@/app/actions/blocks';
import type { BlockedUser } from '@/lib/blocks';

export default function BlockedUsers(props: { users: BlockedUser[] }) {
	const router = useRouter();
	const [pendingId, setPendingId] = useState<number | undefined>();
	const [error, setError] = useState<string | undefined>();

	const unblock = async (userdetailsid: number) => {
		setPendingId(userdetailsid);
		setError(undefined);
		try {
			const result = await unblockUser({ userdetailsid });
			if (result.ok) router.refresh();
			else setError(result.error);
		} catch (unblockError) {
			console.error('Unblock failed', unblockError);
			setError('We could not unblock this user. Please try again.');
		} finally {
			setPendingId(undefined);
		}
	};

	if (!props.users.length) {
		return <p className="mt-2 text-sm text-lvartsmusic-muted">You haven&apos;t blocked anyone.</p>;
	}

	return (
		<>
			{error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
			<ul className="mt-3 flex flex-col gap-3">
				{props.users.map((user) => (
					<li key={user.id} className="flex items-center justify-between gap-3">
						<div className="flex min-w-0 items-center gap-3">
							<Avatar
								imageUrl={user.userdir && user.avatar ? `${imageUrl}/${user.userdir}/${user.avatar}` : undefined}
								displayName={user.displayname}
								handle={user.handle}
								size="sm"
							/>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold">{user.displayname ?? `@${user.handle}`}</p>
								{user.handle && <p className="truncate text-xs text-lvartsmusic-muted">@{user.handle}</p>}
							</div>
						</div>
						<Button
							type="button"
							className="cursor-pointer rounded-full bg-orange px-3.5 py-1.5 text-sm text-white disabled:opacity-50"
							onClick={() => unblock(user.id)}
							disabled={pendingId === user.id}
						>
							Unblock
						</Button>
					</li>
				))}
			</ul>
		</>
	);
}
