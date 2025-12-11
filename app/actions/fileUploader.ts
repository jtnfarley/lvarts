'use server'

import https from 'https';
import fs, { read } from 'fs';

export default async function uploadFile(params:{file:File, userDir:string}) {
    const {file, userDir} = params;
    const REGION = 'ny'; // If German region, set this to an empty string: ''
    const BASE_HOSTNAME = 'storage.bunnycdn.com';
    const HOSTNAME = REGION ? `${REGION}.${BASE_HOSTNAME}` : BASE_HOSTNAME;
    const STORAGE_ZONE_NAME = 'lvartsmusic-ny';
    const FILENAME_TO_UPLOAD = `${userDir}/${file.name}`;
    const ACCESS_KEY = process.env.BUNNY_KEY;
    const url = `https://${HOSTNAME}/${STORAGE_ZONE_NAME}/${FILENAME_TO_UPLOAD}`


    const readStream = file.stream();

    const options = {
        method: 'PUT',
        headers: {
            AccessKey: ACCESS_KEY,
            'Content-Type': 'application/octet-stream',
        },
        body: readStream
    };

    try {
    const response = await fetch(url, options);

    if (response.ok) {
      console.log('File uploaded successfully!');
    } else {
      console.error('File upload failed:', response.statusText);
    }
  } catch (error) {
    console.error('Error during file upload:', error);
  }

    // const req = https.request(options, (res) => {
    //     res.on('data', (chunk) => {
    //     console.log(chunk.toString('utf8'));
    //     });
    // });

    // req.on('error', (error) => {
    //     console.error(error);
    // });

    // // readStream.pipe(req);
};
