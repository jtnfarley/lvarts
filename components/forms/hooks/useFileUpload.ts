'use client'

import { useState } from "react";
import { radioUpload } from "@/app/actions/fileUploader";
import { uploadViaWorker } from "@/lib/clientUpload";
import { compressImage } from "@/lib/utils";
import { MAX_POST_IMAGES } from "@/lib/posts/postImages";
import imageUrl from "@/constants/imageUrl";
import OptimizedFile from "@/lib/models/optimizedFile";
import User from "@/lib/models/user";
import { FeedRow } from "@/lib/models/initFeedRow";

// An image on the post form. `uploaded` is true for images already on the CDN, which an
// edit must not upload again.
export type PostImage = OptimizedFile & { uploaded: boolean };

const UPLOAD_CONCURRENCY = 3;

const fileFromOptimizedFile = async (optimized: OptimizedFile): Promise<File> => {
    const res = await fetch(optimized.url);
    const blob = await res.blob();
    return new File([blob], optimized.name, { type: optimized.type });
};

// A random suffix keeps two photos with the same name from overwriting each other in the user's folder.
const uniqueImageName = (originalName: string): string => {
    const base = originalName.split('.')[0].replaceAll('(', '').replaceAll(')', '').slice(0, 60);
    return `${base}-${crypto.randomUUID().slice(0, 8)}.webp`;
};

const existingFileType = (post: Partial<FeedRow> | undefined) =>
    post?.filetypes?.filetype ?? post?.filetype ?? 'image/webp';

export const useFileUpload = (post: Partial<FeedRow> | undefined, user: User, addToRadio: boolean | undefined) => {
    // Audio (and any other non-image file) is a single file; images are a list.
    const [tempFile, setTempFile] = useState<OptimizedFile | undefined>(() => {
        const postfile = post?.postfile;
        const userdir = post?.userdetails?.userdir;
        const type = existingFileType(post);
        if (postfile && userdir && !type.startsWith('image/')) {
            return { name: postfile, type, url: `${imageUrl}/${userdir}/${postfile}` };
        }
        return undefined;
    });
    const [images, setImages] = useState<PostImage[]>(() => {
        const postfile = post?.postfile;
        const userdir = post?.userdetails?.userdir;
        const type = existingFileType(post);
        if (!postfile || !userdir || !type.startsWith('image/')) return [];
        return [postfile, ...(post?.extrafiles ?? [])].map((name, index) => ({
            name,
            type: index === 0 ? type : 'image/webp',
            url: `${imageUrl}/${userdir}/${name}`,
            uploaded: true,
        }));
    });
    const [uploadError, setUploadError] = useState<string | null>(null);

    const addImages = async (files: File[]) => {
        const picked = files.filter((file) => file.type.startsWith('image/'));
        const room = MAX_POST_IMAGES - images.length;
        setUploadError(picked.length > room ? `A post can have up to ${MAX_POST_IMAGES} images.` : null);

        try {
            const added: PostImage[] = [];
            for (const file of picked.slice(0, Math.max(room, 0))) {
                const url = await compressImage(file);
                if (url) added.push({ name: uniqueImageName(file.name), type: 'image/webp', url, uploaded: false });
            }
            setImages((current) => [...current, ...added].slice(0, MAX_POST_IMAGES));
        } catch (error) {
            console.error('Could not read image', error);
            setUploadError('Could not read one of the images. Please try another.');
        }
    };

    const removeImage = (index: number) => setImages((current) => current.filter((_, i) => i !== index));

    const moveImage = (index: number, direction: -1 | 1) =>
        setImages((current) => {
            const target = index + direction;
            if (target < 0 || target >= current.length) return current;
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });

    const setupTempFile = async (file: File) => {
        if (!file) return;

        if (/audio/.test(file.type) && file.size > 10 * 1024 * 1024) {
            setUploadError('File is too large. Please upload an MP3 under 10MB.');
            return;
        }

        setUploadError(null);

        if (/audio/.test(file.type)) {
            setTempFile({ name: file.name, type: file.type, url: URL.createObjectURL(file) });
        }
    };

    const clearFiles = () => {
        setTempFile(undefined);
        setImages([]);
    };

    const uploadNewImages = async (userdir: string) => {
        const pending = images.filter((image) => !image.uploaded);
        for (let start = 0; start < pending.length; start += UPLOAD_CONCURRENCY) {
            await Promise.all(
                pending.slice(start, start + UPLOAD_CONCURRENCY).map(async (image) => {
                    await uploadViaWorker(await fileFromOptimizedFile(image), userdir);
                    // So a retry after a later failure does not upload this one again.
                    setImages((current) => current.map((item) => (item.name === image.name ? { ...item, uploaded: true } : item)));
                })
            );
        }
    };

    const handleUpload = async (values: any): Promise<{ postfile?: string; postfiles?: string[]; postfiletype?: string; addToRadio?: boolean }> => {
        // When an admin edits someone else's post, files belong in the post author's folder.
        const userdir = post?.userdetails?.userdir ?? user?.userdetails?.userdir;
        if (!userdir) return {};

        if (!tempFile) {
            await uploadNewImages(userdir);
            return { postfiles: images.map((image) => image.name), postfiletype: images[0]?.type };
        }

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

    return { tempFile, images, addImages, removeImage, moveImage, clearFiles, uploadError, setUploadError, setupTempFile, handleUpload };
};
