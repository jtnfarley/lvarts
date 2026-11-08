import AddEventForm from '@/components/forms/AddEventForm';
import { savePost } from '@/app/data/posts';
import { CALENDAR_EMAIL } from '@/lib/importer/db';
import { prisma } from '@/prisma';
import type User from '@/lib/models/user';

export default async function AdminAddEventPage() {
	// The layout already limits /admin to admins. The form is the normal event form, but saves as the calendar account.
	const calendarUser = await prisma.user.findUnique({
		where: { email: CALENDAR_EMAIL },
		include: { userdetails: true },
	});
	if (!calendarUser?.userdetails) throw new Error('Calendar account not found. Run scripts/seed-calendar.ts first.');

	return (
		<div className="mx-auto max-w-3xl p-5">
			<p className="mb-3 text-sm opacity-80">Posting as the LV Art &amp; Music Calendar account. Events are published immediately.</p>
			<AddEventForm user={calendarUser as unknown as User} savePost={savePost} />
		</div>
	);
}
