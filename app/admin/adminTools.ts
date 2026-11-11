export const adminTools = [
	{ href: '/admin/reports', label: 'Reports', description: 'Review posts and profiles that users have reported.' },
	{ href: '/admin/imports', label: 'Event imports', description: 'Review, publish, or reject events imported from venue sites.' },
	{ href: '/admin/add-event', label: 'Add event', description: 'Add a calendar event as the LV Art & Music Calendar account.' },
	{ href: '/admin/events', label: 'Manage events', description: 'Edit or delete upcoming calendar events.' },
	{ href: '/admin/scraper', label: 'Scraper', description: 'Review scraper runs and diffs, or run a scrape now.' },
	{ href: '/admin/cards', label: 'Instagram cards', description: 'Preview and download daily and weekend event cards.' },
] as const;
