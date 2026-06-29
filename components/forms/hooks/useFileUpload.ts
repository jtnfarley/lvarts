'use client'

import { useState } from "react";
import { uploadFile, ftpFile } from "@/app/actions/fileUploader";
import { compressImage } from "@/lib/utils";
import imageUrl from "@/constants/imageUrl";
import OptimizedFile from "@/lib/models/optimizedFile";
import User from "@/lib/models/user";
import { FeedRow } from "@/lib/models/initFeedRow";

const sendFile = async (file: File, userdir: string) => {
    await uploadFile({ file, userdir });
};

export const sendImageFile = async (tempFile: OptimizedFile, userdir: string): Promise<File> => {
    const res = await fetch(tempFile.url);
    const blob = await res.blob();
    const file = new File([blob], tempFile.name, { type: tempFile.type });
    sendFile(file, userdir);
    return file;
};

const sendAudioFile = async (tempFile: OptimizedFile, userdir: string): Promise<File> => {
    const res = await fetch(tempFile.url);
    const blob = await res.blob();
    const file = new File([blob], tempFile.name, { type: tempFile.type });
    await ftpFile(file);
    return file;
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

        if (file.type.match(/audio/) && file.size > 10 * 1024 * 1024) {
            setUploadError('File is too large. Please upload an MP3 under 10MB.');
            return;
        }

        setUploadError(null);

        const fileObj: OptimizedFile = { name: '', type: '', url: '' };
        let fileUrl: string | undefined;

        if (file.type.match(/image/)) {
            fileUrl = await compressImage(file);
            fileObj.type = 'image/webp';
            fileObj.name = file.name.split('.')[0].replaceAll('(', '').replaceAll(')', '') + '.webp';
        } else if (file.type.match(/audio/)) {
            fileUrl = URL.createObjectURL(file);
            fileObj.type = file.type;
            fileObj.name = file.name;
        }

        fileObj.url = fileUrl ?? '';
        setTempFile(fileObj);
    };

    // Returns the uploaded File, or throws on error. Caller should set isSaving around this.
    const handleUpload = async (values: any): Promise<{ postfile?: string; postfiletype?: string; addToRadio?: boolean }> => {
        const userdir = user?.userdetails?.userdir;
        if (!tempFile || !userdir) return {};

        const isAudio = tempFile.type.match(/audio/);

        let file = await sendImageFile(tempFile, userdir);

        if (isAudio && addToRadio) {
            file = await sendAudioFile(tempFile, userdir);

            if (values.coverartfile) {
                sendImageFile(values.coverartfile, userdir);
            }

            return { postfile: file.name, postfiletype: file.type, addToRadio: true };
        }

        return { postfile: file.name, postfiletype: file.type };
    };

    return { tempFile, setTempFile, uploadError, setUploadError, setupTempFile, handleUpload };
};
