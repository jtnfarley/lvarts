'use client'

import { useState } from "react";
import { radioUpload } from "@/app/actions/fileUploader";
import { compressImage } from "@/lib/utils";
import imageUrl from "@/constants/imageUrl";
import OptimizedFile from "@/lib/models/optimizedFile";
import User from "@/lib/models/user";
import { FeedRow } from "@/lib/models/initFeedRow";

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

const uploadViaWorker = async (file: File, userdir: string) => {
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

const fileFromOptimizedFile = async (optimized: OptimizedFile): Promise<File> => {
    const res = await fetch(optimized.url);
    const blob = await res.blob();
    return new File([blob], optimized.name, { type: optimized.type });
};

export const useFileUpload = (post: Partial<FeedRow> | undefined, user: User, addToRadio: boolean | undefined) => {
    const [tempFile, setTempFile] = useState<OptimizedFile | undefined>(() => {
        const postfile = post?.postfile;
        const userdir = post?.userdetails?.userdir;
        if (postfile && userdir) {
            return {
                name: postfile,
                type: post?.filetypes?.filetype ?? post?.filetype ?? 'image/webp',
                url: `${imageUrl}/${userdir}/${postfile}`,
            } as OptimizedFile;
        }
        return undefined;
    });
    const [uploadError, setUploadError] = useState<string | null>(null);

    const setupTempFile = async (file: File) => {
        if (!file) return;

        if (/audio/.test(file.type) && file.size > 10 * 1024 * 1024) {
            setUploadError('File is too large. Please upload an MP3 under 10MB.');
            return;
        }

        setUploadError(null);

        const fileObj: OptimizedFile = { name: '', type: '', url: '' };
        let fileUrl: string | undefined;

        if (/image/.test(file.type)) {
            fileUrl = await compressImage(file);
            fileObj.type = 'image/webp';
            fileObj.name = file.name.split('.')[0].replaceAll('(', '').replaceAll(')', '') + '.webp';
        } else if (/audio/.test(file.type)) {
            fileUrl = URL.createObjectURL(file);
            fileObj.type = file.type;
            fileObj.name = file.name;
        }

        fileObj.url = fileUrl ?? '';
        setTempFile(fileObj);
    };

    const handleUpload = async (values: any): Promise<{ postfile?: string; postfiletype?: string; addToRadio?: boolean }> => {
        const userdir = user?.userdetails?.userdir;
        if (!tempFile || !userdir) return {};

        const isAudio = /audio/.test(tempFile.type);
        const file = await fileFromOptimizedFile(tempFile);

        await uploadViaWorker(file, userdir);

        if (isAudio && addToRadio) {
            if (values.coverartfile?.url) {
                const coverFile = await fileFromOptimizedFile(values.coverartfile as OptimizedFile);
                await uploadViaWorker(coverFile, userdir);
            }
            await radioUpload(file.name, userdir);
            return { postfile: file.name, postfiletype: file.type, addToRadio: true };
        }

        return { postfile: file.name, postfiletype: file.type };
    };

    return { tempFile, setTempFile, uploadError, setUploadError, setupTempFile, handleUpload };
};
