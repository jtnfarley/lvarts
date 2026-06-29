'use server'

import path from 'node:path';

type SftpClientInstance = Awaited<ReturnType<typeof connectSftp>>;

const connectSftp = async (params: { host: string; username: string; password?: string; privateKey?: string; passphrase?: string }) => {
    const { host, username, password, privateKey, passphrase } = params;
    // Load ssh2 only when the SFTP path is used so client-referenced server actions
    // do not pull native ssh2 optional dependencies into the dev bundler.
    const { default: SftpClient } = await import('ssh2-sftp-client');
    const client = new SftpClient();

    await client.connect({
        host,
        port: 2022,
        username,
        password,
        privateKey,
        passphrase
    });

    return client;
};

export const uploadFile = async (params:{file:File, userdir:string}) => {
    const {file, userdir} = params;
    const REGION = 'ny'; // If German region, set this to an empty string: ''
    const BASE_HOSTNAME = 'storage.bunnycdn.com';
    const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
    const STORAGE_ZONE_NAME = 'lvartsmusic-ny';
    const FILENAME_TO_UPLOAD = `${userdir}/${file.name}`;
    const ACCESS_KEY = process.env.BUNNY_KEY;
    const url = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${FILENAME_TO_UPLOAD}`

    if (!ACCESS_KEY) {
        throw new Error('Missing BUNNY_KEY environment variable');
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    try {
        await fetch(url, {
            method: 'PUT',
            headers: {
                'AccessKey': ACCESS_KEY,
                'Content-Type': 'application/octet-stream',
            },
            body: fileBuffer
        });
  } catch (error) {
    // console.error('Error during file upload:', error);
  }
};


export const ftpFile = async (file:File) => {
    const formData = new FormData();
    formData.append('file', file);

    await fetch('https://a6.asurahosting.com/api/station/614/files/upload', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.AZURACAST_API_KEY}`
        },
        body: formData
    })
    .catch(err => console.log(err));

}

// export const deleteFtpFile = async (file:File) => {
//     const username = process.env.SFTP_USERNAME;
//     const password = process.env.SFTP_PASSWORD;
//     const privateKey = process.env.SFTP_PRIVATE_KEY?.replace(/\\n/g, '\n');
//     const passphrase = process.env.SFTP_PASSPHRASE;

//     if (!username) {
//         throw new Error('Missing SFTP_USERNAME environment variable');
//     }

//     if (!password && !privateKey) {
//         throw new Error('Missing SFTP_PASSWORD or SFTP_PRIVATE_KEY environment variable');
//     }

//     const safeFileName = path.posix.basename(file.name);
//     const remotePath = path.posix.join('default', safeFileName);
//     const uploadHosts = ['a6.asurahosting.com', '65.108.143.81'];
//     const fileBuffer = Buffer.from(await file.arrayBuffer());
//     let lastError: Error | undefined;

//     for (const host of uploadHosts) {
//         let client: SftpClientInstance | undefined;

//         try {
//             client = await connectSftp({
//                 host,
//                 username,
//                 password,
//                 privateKey,
//                 passphrase
//             });
//             await client.put(fileBuffer, remotePath);
//             return;
//         } catch (error) {
//             lastError = error instanceof Error ? error : new Error(String(error));
//         } finally {
//             if (client) {
//                 await client.end().catch(() => undefined);
//             }
//         }
//     }

//     throw lastError ?? new Error('SFTP upload failed');
// }