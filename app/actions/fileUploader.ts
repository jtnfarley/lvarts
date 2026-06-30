'use server'

export const uploadFile = async (params: { file: File; userdir: string }) => {
    const { file, userdir } = params;
    const url = `https://ny.storage.bunnycdn.com/lvartsmusic-ny/${userdir}/${file.name}`;
    const ACCESS_KEY = process.env.BUNNY_KEY;
    if (!ACCESS_KEY) throw new Error('Missing BUNNY_KEY environment variable');

    await fetch(url, {
        method: 'PUT',
        headers: { 'AccessKey': ACCESS_KEY, 'Content-Type': 'application/octet-stream' },
        body: Buffer.from(await file.arrayBuffer()),
    });
};

// Fetches an audio file already on BunnyCDN and forwards it to AzuraCast.
// Called after the client has completed a direct CDN upload, so no file data
// passes through Vercel — only the filename + a server-to-server relay.
export const radioUpload = async (filename: string, userdir: string) => {
    const cdnUrl = `https://lvartsmusic-ny.b-cdn.net/${userdir}/${filename}`;

    const fileRes = await fetch(cdnUrl);
    if (!fileRes.ok) throw new Error(`Failed to fetch audio from CDN: ${fileRes.status}`);

    const blob = await fileRes.blob();
    const file = new File([blob], filename, { type: blob.type || 'audio/mpeg' });

    const formData = new FormData();
    formData.append('file', file);

    await fetch('https://a6.asurahosting.com/api/station/614/files/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.AZURACAST_API_KEY}` },
        body: formData,
    }).catch(err => console.error('AzuraCast upload error:', err));
};
