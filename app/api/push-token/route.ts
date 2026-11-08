import { z } from 'zod';
import { isLoggedIn } from '@/app/data/currentUser';
import { prisma } from '@/prisma';
import { expoPushTokenSchema } from '@/lib/push';

const bodySchema = z.object({ token: expoPushTokenSchema });

// Called by the mobile app's WebView with the user's session cookie. A logged-out
// request removes the token, so a device stops receiving the previous user's pushes
// after they sign out.
export async function POST(request: Request) {
    const parsed = bodySchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
        return Response.json({ error: 'Invalid push token' }, { status: 400 });
    }
    const { token } = parsed.data;

    const user = await isLoggedIn();
    const userdetailsid = user?.userdetails?.id;
    if (!userdetailsid) {
        await prisma.pushtokens.deleteMany({ where: { token } });
        return Response.json({ error: 'Not logged in' }, { status: 401 });
    }

    // A token belongs to one device; if a different user signs in on it, it moves to them.
    await prisma.pushtokens.upsert({
        where: { token },
        create: { token, userdetailsid },
        update: { userdetailsid },
    });
    return Response.json({ ok: true });
}
