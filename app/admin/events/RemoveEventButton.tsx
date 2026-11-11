'use client';

import { removeCalendarEvent } from './actions';

export function RemoveEventButton({ postId, eventName }: { postId: number; eventName: string }) {
	return (
		<form
			action={removeCalendarEvent.bind(null, postId)}
			onSubmit={(event) => {
				if (!window.confirm(`Delete "${eventName}"? It will be hidden from the calendar.`)) event.preventDefault();
			}}
		>
			<button type="submit" className="rounded border px-3 py-1.5 text-sm text-red-600">
				Delete
			</button>
		</form>
	);
}
