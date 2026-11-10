'use client'

import { useState } from 'react';
import { saveNotificationSettings } from '@/app/actions/notificationSettings';
import type { NotificationSettings } from '@/lib/notificationSettings';

const TYPE_TOGGLES: { key: Exclude<keyof NotificationSettings, 'pushpaused'>; label: string }[] = [
	{ key: 'pushlikes', label: 'Likes on your posts' },
	{ key: 'pushcomments', label: 'Comments on your posts' },
	{ key: 'pushmentions', label: 'Mentions' },
	{ key: 'pushfollows', label: 'New followers' },
];

export default function NotificationSettingsForm(props: { settings: NotificationSettings }) {
	const [settings, setSettings] = useState(props.settings);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | undefined>();

	const update = async (key: keyof NotificationSettings, value: boolean) => {
		const previous = settings;
		const next = { ...settings, [key]: value };
		setSettings(next);
		setIsSaving(true);
		setError(undefined);
		try {
			const result = await saveNotificationSettings(next);
			if (!result.ok) {
				setSettings(previous);
				setError(result.error);
			}
		} catch (saveError) {
			console.error('Saving notification settings failed', saveError);
			setSettings(previous);
			setError('We could not save your settings. Please try again.');
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<div className="mt-3 flex flex-col gap-3">
			{error && <p className="text-sm text-rose-500">{error}</p>}
			<label className="flex items-center gap-3 text-sm font-semibold">
				<input
					type="checkbox"
					className="h-4 w-4 accent-orange"
					checked={settings.pushpaused}
					disabled={isSaving}
					onChange={(event) => update('pushpaused', event.target.checked)}
				/>
				Pause all push notifications
			</label>
			<ul className="flex flex-col gap-3 ps-1">
				{TYPE_TOGGLES.map(({ key, label }) => (
					<li key={key}>
						<label className="flex items-center gap-3 text-sm">
							<input
								type="checkbox"
								className="h-4 w-4 accent-orange"
								checked={settings[key]}
								disabled={isSaving || settings.pushpaused}
								onChange={(event) => update(key, event.target.checked)}
							/>
							{label}
						</label>
					</li>
				))}
			</ul>
		</div>
	);
}
