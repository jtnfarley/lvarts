import { isSafeUserdir } from '@/lib/userdir';

const STORAGE_URL = 'https://ny.storage.bunnycdn.com/lvartsmusic-ny';
const BUNNY_TIMEOUT_MS = 15000;

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
    if (!isSafeUserdir(userdir)) throw new Error(`Refusing to use unsafe userdir: ${userdir}`);
};

// Removes the directory and everything in it. The trailing slash is what makes
// BunnyCDN treat the path as a directory.
export const deleteUserDirectory = async (userdir: string) => {
    assertSafeUserdir(userdir);
    await deleteFromStorage(`${userdir}/`);
};

export const isSafeFilename = (filename: string): boolean =>
    filename !== '' && filename !== '.' && filename !== '..' && !/[\\/]/.test(filename);

export const deleteUserFile = async (userdir: string, filename: string) => {
    assertSafeUserdir(userdir);
    if (!isSafeFilename(filename)) throw new Error(`Refusing to delete unsafe filename: ${filename}`);
    await deleteFromStorage(`${userdir}/${encodeURIComponent(filename)}`);
};

// Trusted: writes to whichever folder the caller names, with NO authorization. Only server
// code that has already decided where the file belongs (the AI bots, the event importer)
// may call this. It must not live in a 'use server' file, where any browser could call it.
export const uploadFile = async (params: { file: File; userdir: string }) => {
    const { file, userdir } = params;
    assertSafeUserdir(userdir);
    if (!isSafeFilename(file.name)) throw new Error(`Refusing to upload unsafe filename: ${file.name}`);

    const accessKey = process.env.BUNNY_KEY;
    if (!accessKey) throw new Error('Missing BUNNY_KEY environment variable');

    await fetch(`${STORAGE_URL}/${userdir}/${encodeURIComponent(file.name)}`, {
        method: 'PUT',
        headers: { AccessKey: accessKey, 'Content-Type': 'application/octet-stream' },
        body: Buffer.from(await file.arrayBuffer()),
    });
};
