const getUploadToken = async (userdir: string, filename: string): Promise<string> => {
    const res = await fetch('/api/upload-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userdir, filename }),
    });
    if (!res.ok) throw new Error('Failed to get upload token');
    const { token } = await res.json();
    return token;
};

export const uploadViaWorker = async (file: File, userdir: string) => {
    const workerUrl = process.env.NEXT_PUBLIC_UPLOAD_WORKER_URL;
    if (!workerUrl) throw new Error('NEXT_PUBLIC_UPLOAD_WORKER_URL is not set');

    const token = await getUploadToken(userdir, file.name);
    const res = await fetch(`${workerUrl}/${userdir}/${file.name}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/octet-stream',
            'X-Upload-Token': token,
        },
        body: file,
    });
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
};
