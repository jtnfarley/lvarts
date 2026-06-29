'use client'

import { Controller, useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";

import RTEditor from "./Fields/RichTextEditor/RTEditor";
import {uploadFile, ftpFile} from "@/app/actions/fileUploader";
import User from "@/lib/models/user";
import MediaUpload from "@/components/PostUi/MediaUpload"
import { compressImage, subjects, adjectives, boringAdjectives } from "@/lib/utils";
import OptimizedFile from "@/lib/models/optimizedFile";
import { Spinner } from "../layout/Spinner";
import imageUrl from "@/constants/imageUrl";
import { isSceneScheduledPostType } from "@/lib/scenePosts";
import { searchVenues, type VenueSuggestion } from "@/app/actions/venues";
import { getAITextResponse } from "@/app/actions/openAIBridge";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";
import AudioUploadLink from "../PostUi/AudioUploadLink";
import AddEventLink from "../PostUi/AddEventLink";
import EventFields from "./Fields/EventFields";
import AudioFields from "./Fields/AudioFields";
import { FeedRow } from "@/lib/models/initFeedRow";

interface Props {
    savePost:Function,
    user: User,
    posttype?: string,
    edited?: boolean,
    post?:FeedRow,
    onAudioFileSelected?: (selected: boolean) => void,
    addToRadio?: boolean,
}

const PostValidation = z.object({
    userdetailsid: z.number(),
    posttype: z.string().optional(),
    edited: z.boolean().optional(),
    parentPostId: z.string().optional(),
    content: z.any().optional(),
    lexical: z.string().optional(),
    id: z.number().optional(),
    postfile: z.string().optional(),
    isgalleryfile: z.boolean().optional(),
    postfiletype: z.string().optional(),
    postfileObj: z.any().optional(),
    eventid: z.number().optional(),
    eventname: z.string().optional(),
    eventdate: z.date().nullable().optional(),
    venuename: z.string().optional(),
    address: z.string().optional(),
    venueid: z.number().optional(),
    trackname: z.string().optional(),
    artist: z.string().optional(),
    album: z.string().optional(),
    releaseyear: z.number().optional(),
    coverartfile: z.any().optional(),
    addToRadio: z.boolean().optional()
    // privatepost: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (data.posttype === 'audio') {
        if (!data.trackname?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Track title is required', path: ['trackname'] });
        }
        if (!data.artist?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Artist name is required', path: ['artist'] });
        }
    }
})
const sendFile = async (filedata:{file:File, userdir:string}) => {
    const {file, userdir} = filedata;
    await uploadFile({file, userdir});
}

const sendImageFile = async (tempFile:any, userdir:string):Promise<File> => {
    const res = await fetch(tempFile.url);
    const blob = await res.blob();
    const file = new File([blob], tempFile.name, {type: tempFile.type})

    sendFile({file, userdir});

    return file;
}

const sendAudioFile = async (tempFile:any, userdir:string):Promise<File> => {
    const res = await fetch(tempFile.url);
    const blob = await res.blob();
    const file = new File([blob], tempFile.name, {type: tempFile.type})

    await ftpFile(file);

    return file;
}

const PostForm = ({user, edited, savePost, post, onAudioFileSelected, addToRadio}: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const [tempFile, setTempFile] = useState<OptimizedFile | undefined>();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isAIIfied, setIsAIIfied] = useState<boolean>(false);
    const [venueQuery, setVenueQuery] = useState(post?.venues?.venuename ?? post?.venuename ?? '');
    const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([]);
    const [isVenueSearchOpen, setIsVenueSearchOpen] = useState(false);
    const [isVenueSearching, setIsVenueSearching] = useState(false);
    const [showTones, setShowTones] = useState(false);
    const contentBackup = useRef<string[]>([]);
    const editorRef:any = useRef(null);
    const parentPostId = post?.parentPostId !== undefined ? post.parentPostId?.toString() : undefined;
    const id = post?.id ?? undefined;
    const content = post?.lexical ?? "";
    const postfile = post?.postfile ?? undefined;
    const resolvedPostType = post?.posttype ?? post?.posttypes?.posttype ?? 'post';
    const eventid = post?.events?.id ?? post?.eventid ?? undefined;
    const eventname = post?.events?.eventname ?? post?.eventname ?? '';
    const eventdate = post?.events?.eventdate ?? post?.eventdate ?? undefined;
    const venuename = post?.events?.venues?.venuename ?? post?.venuename ?? '';
    const address = post?.events?.venues?.address ?? post?.address ?? '';
    const venueid = post?.events?.venueid ?? post?.venueid ?? undefined;
    // const isScenePost = isSceneCommunityPostType(resolvedPostType)
    const isScheduledPost = isSceneScheduledPostType(resolvedPostType);

    const trackname = post?.audio?.trackname ?? undefined;
    const artist = post?.audio?.artist ?? undefined;
    const album = post?.audio?.album ?? undefined;
    const releaseyear = post?.audio?.releaseyear ?? undefined;
    const coverartfile = post?.audio?.coverartfile ?? undefined;


    const defaultValues = {
        userdetailsid: user.userdetails?.id,
        posttype: resolvedPostType,
        edited: edited ?? false,
        parentPostId,
        id,
        content,
        eventid,
        eventname,
        eventdate,
        venuename,
        address,
        venueid,
        trackname,
        artist,
        album,
        releaseyear,
        coverartfile,
        addToRadio
    }

    const { register, handleSubmit, setValue, control, reset, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues
    })
    const venuenameRegistration = register('venuename')

    const normalizeOptionalValue = (value?: string) => {
        const normalized = value?.trim()

        return normalized ? normalized : undefined
    }

    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        setUploadError(null);
        setIsSaving(true);

        if (post?.id) {
            values.id = post.id;
        }

        if (parentPostId) {
            values.parentPostId = parentPostId;
        }

        if (values.content?.html && values.content.lexical) {
            const {html, lexical} = values.content;
            values.content = html;
            values.lexical = JSON.stringify(lexical);
        }

        values.eventname = normalizeOptionalValue(values.eventname)
        values.venuename = normalizeOptionalValue(values.venuename)
        values.address = normalizeOptionalValue(values.address)

        let userdir;

        if (user?.userdetails)
            userdir = user.userdetails.userdir;

        if (tempFile && userdir) {
            try {
                let file = await sendImageFile(tempFile, userdir);

                if (tempFile.type.match(/audio/) && addToRadio) {
                    file = await sendAudioFile(tempFile, userdir);

                    values.addToRadio = addToRadio;

                    if (values.coverartfile) {
                        sendImageFile(values.coverartfile, userdir);
                    }
                }

                if (file) {
                    values.postfile = file.name;
                    values.postfiletype = file.type;
                }
            } catch (error: any) {
                const is413 = error?.statusCode === 413 || error?.message?.includes('Body exceeded');
                setUploadError(is413 ? 'File is too large. Please upload an MP3 under 10MB.' : 'Upload failed. Please try again.');
                setIsSaving(false);
                return;
            }
        }

        let isAudio = false
        if (values.posttype === 'audio') {
            values.posttype = 'post';
            isAudio = true;
        }

        await savePost(values);
        
        if (post?.id) {
            dispatchEvent(new CustomEvent("postsUpdated", {
				detail: {
					action: `edit`,
					postid: post.id
				}
			}));
        } else {
            dispatchEvent(new Event('postsUpdated'));
        }

        setIsSaving(false);
        setSaved(true);

        setTimeout(() => {
            setSaved(false);
        }, 3000)

        if (!post?.id) {
            setClearEditor(true);
            setTempFile(undefined);
        }
    }

    const setupTempFile = async (file:File) => {
        if (file) {
            if (file.type.match(/audio/) && file.size > 10 * 1024 * 1024) {
                setUploadError('File is too large. Please upload an MP3 under 10MB.');
                return;
            }

            setUploadError(null);

            const fileObj:OptimizedFile = {
                name: '',
                type:'',
                url:''
            };

            let fileUrl;

            if (file.type.match(/image/)) {
                fileUrl = await compressImage(file);
                fileObj.type = 'image/webp';
                fileObj.name = file.name.split('.')[0].replaceAll('(', '').replaceAll(')','') +'.webp';
            } else if (file.type.match(/audio/)){
                fileUrl = URL.createObjectURL(file);
                fileObj.type = file.type;
                fileObj.name = file.name;
                onAudioFileSelected?.(true);
            }

            fileObj.url = fileUrl || '';

            setTempFile(fileObj);
        }
    }

    const setPostFile = () => {
        if (postfile && post?.userdetails?.userdir) {
            setTempFile({
                name: postfile,
                type: post?.filetypes?.filetype ?? post?.filetype ?? 'image/webp',
                url: `${imageUrl}/${post.userdetails.userdir}/${postfile}`
            } as OptimizedFile);
        }
    }

    useEffect(() => {
        if (isSubmitSuccessful && !post?.id) {
            reset(defaultValues);
            setVenueQuery('');
            setVenueSuggestions([]);
            setIsVenueSearchOpen(false);
        }
    }, [defaultValues, isSubmitSuccessful, post?.id, reset, errors]);

    useEffect(() => {
        const trimmedQuery = venueQuery.trim()

        if (!isScheduledPost || trimmedQuery.length < 2) {
            setVenueSuggestions([]);
            setIsVenueSearching(false);
            return;
        }

        let isCurrentSearch = true;
        setIsVenueSearching(true);

        const timeout = window.setTimeout(async () => {
            try {
                const venues = await searchVenues(trimmedQuery);

                if (isCurrentSearch) {
                    setVenueSuggestions(venues);
                }
            } finally {
                if (isCurrentSearch) {
                    setIsVenueSearching(false);
                }
            }
        }, 250);

        return () => {
            isCurrentSearch = false;
            window.clearTimeout(timeout);
        }
    }, [isScheduledPost, venueQuery]);

    const selectVenue = (venue:VenueSuggestion) => {
        setValue('venuename', venue.venuename, { shouldDirty: true });
        setValue('venueid', venue.id, { shouldDirty: true });
        setValue('address', venue.address ?? '', { shouldDirty: true });
        setVenueQuery(venue.venuename);
        setVenueSuggestions([]);
        setIsVenueSearchOpen(false);
    }

    const aiIfy = async (adjective = 'funny') => {
        if (!editorRef.current) {
            return;
        }

        setShowTones(false);

        const text = editorRef.current.getEditorState().read(() => $getRoot().getTextContent().trim());

        if (!text) {
            return;
        }

        setIsSaving(true);
        contentBackup.current.push(text);
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        // const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const adjective3 = adjectives[Math.floor(Math.random() * adjectives.length)];
        const article = /^[aeiou]/i.test(adjective) ? 'an' : 'a';
        const prompt = `You are a ${adjective} person. Rewrite this post in a ${adjective} tone: ${text}. Do not use emojis. keep the response under 400 characters.`

        try {
            const res = await getAITextResponse(prompt);

            editorRef.current.update(() => {
                const root = $getRoot();
                const lines = res.split(/\r?\n/);

                root.clear();

                lines.forEach((line:string) => {
                    const paragraph = $createParagraphNode();

                    if (line.length > 0) {
                        paragraph.append($createTextNode(line));
                    }

                    root.append(paragraph);
                });
                const paragraph = $createParagraphNode();
                const note = $createTextNode(`Post formatted by AI for funsies.`);
                note.setFormat('italic');
                paragraph.append(note);

                root.append(paragraph);

                if (lines.length === 0) {
                    root.append($createParagraphNode());
                }

                root.selectEnd();
            });

            setIsAIIfied(true);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    }

    const resetPost = () => {
        if (!editorRef.current) {
            return;
        }

        try {
            editorRef.current.update(() => {
                const root = $getRoot();
                root.clear();

                if (contentBackup.current && contentBackup.current && contentBackup.current.length) {
                    const paragraph = $createParagraphNode();
                    const note = $createTextNode(contentBackup.current[0]);
                    paragraph.append(note);

                    root.append(paragraph);
                }
            });
        } catch (error) {
            console.error(error);
        }

        setIsAIIfied(false);
    }

    const handleEditorUpdated = () => {
        setClearEditor(false);
    }

    useEffect(() => {
        window.addEventListener('editorUpdated', handleEditorUpdated);

        setPostFile();

        return () => {
            window.removeEventListener('editorUpdated', handleEditorUpdated);
        }
    }, []) 

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
			<div>
                {isScheduledPost &&
                    <EventFields 
                        register={register} 
                        control={control} 
                        venuenameRegistration={venuenameRegistration} 
                        setValue={setValue} 
                        setVenueQuery={setVenueQuery}
                        setIsVenueSearchOpen={setIsVenueSearchOpen}
                        isVenueSearchOpen={isVenueSearchOpen}
                        isScheduledPost={isScheduledPost}
                        venueSuggestions={venueSuggestions}
                        isVenueSearching={isVenueSearching}
                        selectVenue={selectVenue}
                    />
                }

                {resolvedPostType && resolvedPostType === 'audio' ?
                    <AudioFields register={register} control={control} setValue={setValue} setupTempFile={setupTempFile} clearEditor={clearEditor} errors={errors} />
                    :
                    <Controller
                        control={control}
                        name='content'
                        render={({ field }) => (
                            <RTEditor
                                ref={editorRef}
                                onChange={field.onChange}
                                clearEditor={clearEditor}
                                content={content}
                                currentUserDetailsId={user?.userdetails?.id || 0}
                            />
                        )}
                    />
                }

                {(tempFile) && (
                    <div className="flex justify-center">
                        {
                            (tempFile.type.match(/audio/)) ?
                                <audio src={tempFile.url} controls/>
                                :
                                <img src={tempFile.url}/>
                        }
                    </div>
                )
                }


                {uploadError && (
                    <div className="mx-4 mb-2 rounded bg-red-100 border border-red-400 px-3 py-2 text-sm text-red-700">
                        {uploadError}
                    </div>
                )}

                <div className="mt-2 flex flex-row p-4">
                    <div className="w-[50%]">
                    {resolvedPostType && resolvedPostType !== 'audio' &&
                        <div className="w-full flex gap-3">
                            <MediaUpload register={register} setValue={setValue} setTempImage={setupTempFile} saved={saved}/>
                            <AudioUploadLink/>
                            <AddEventLink/>
                        </div>
                    }
                    </div>
                    <div className="w-[50%] flex justify-end">
                        {
                            isSaving && 
                            <div className="me-2">
                                <Spinner/>
                            </div>
                        }
                        {
                            saved &&
                            <div className="me-2 bg-green-200 text-xs font-semibold uppercase text-green-700 border-1 border-green-700 px-2 py-1 my-2 rounded-sm"
                            style={{opacity: 0, animation: 'fade-in-out 3s ease-in-out'}}>
                                Post Saved
                            </div>
                        }

                        {
                            isAIIfied &&
                            <button onClick={() => resetPost()} type='button' className="bg-gray-900 me-2 px-2 py-2 rounded text-white font-semibold cursor-pointer disabled:bg-orange-200">
                                Reset
                            </button>
                        }

                        <button onClick={() => setShowTones(true)} type='button' className="bg-white border border-gray-500 me-2 px-2 py-2 rounded text-gray-500 uppercase font-semibold cursor-pointer disabled:bg-orange-200" disabled={isSaving}>
                            AI-ify
                        </button>

                        {showTones &&
                            <div>
                                <div className="text-center">Tone</div>
                                <select
                                    name='aiTones'
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white"
                                    onChange={(e) => aiIfy(e.target.value)}
                                >
                                    <option>Select</option>
                                    {
                                        !!(boringAdjectives?.length) &&
                                            boringAdjectives.map((adjective, index) => (
                                                <option key={index}>{adjective}</option>
                                            ))
                                    }
                                </select>
                            </div>
                        }
    
                        <button type='submit' className="bg-orange px-2 py-2 rounded text-white uppercase font-semibold cursor-pointer disabled:bg-orange-200" disabled={isSaving}>
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PostForm
