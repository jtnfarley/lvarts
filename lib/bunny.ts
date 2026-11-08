const STORAGE_URL = 'https://ny.storage.bunnycdn.com/lvartsmusic-ny';
const BUNNY_TIMEOUT_MS = 15000;
// userdirs are random alphanumerics (or a short fixed name for the bot accounts).
const SAFE_USERDIR = /^[A-Za-z0-9_-]+$/;

// A deliberately plain module, not a 'use server' file: these delete helpers must
// never become endpoints a client can call.
const deleteFromStorage = async (path: string) => {
    const accessKey = process.env.BUNNY_KEY;
    if (!accessKey) throw new Error('Missing BUNNY_KEY environment variable');

    const response = await fetch(`${STORAGE_URL}/${path}`, {
        method: 'DELETE',
        headers: { AccessKey: accessKey },
        signal: AbortSignal.timeout(BUNNY_TIMEOUT_MS),
    });
    // 404 means it is already gone, which is the outcome we want.
    if (!response.ok && response.status !== 404) {
        throw new Error(`BunnyCDN delete failed (${response.status}) for ${path}`);
    }
};

const assertSafeUserdir = (userdir: string) => {
    if (!SAFE_USERDIR.test(userdir)) throw new Error(`Refusing to delete unsafe userdir: ${userdir}`);
};

// Removes the directory and everything in it. The trailing slash is what makes
// BunnyCDN treat the path as a directory.
export const deleteUserDirectory = async (userdir: string) => {
    assertSafeUserdir(userdir);
    await deleteFromStorage(`${userdir}/`);
};

export const deleteUserFile = async (userdir: string, filename: string) => {
    assertSafeUserdir(userdir);
    if (filename === '.' || filename === '..' || /[\\/]/.test(filename)) {
        throw new Error(`Refusing to delete unsafe filename: ${filename}`);
    }
    await deleteFromStorage(`${userdir}/${encodeURIComponent(filename)}`);
};
