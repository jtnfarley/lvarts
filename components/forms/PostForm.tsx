'use client'

import { Controller, useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css'

import RTEditor from "./Fields/RichTextEditor/RTEditor";
import uploadFile from "@/app/actions/fileUploader";
import User from "@/lib/models/user";
import Post from "@/lib/models/post";
import MediaUpload from "@/components/PostUi/MediaUpload"
import { compressImage, subjects, objects, adjectives } from "@/lib/utils";
import OptimizedFile from "@/lib/models/optimizedFile";
import { Spinner } from "../layout/Spinner";
import imageUrl from "@/constants/imageUrl";
import { isSceneScheduledPostType } from "@/lib/scenePosts";
import { BiCalendar } from "react-icons/bi";
import { searchVenues, type VenueSuggestion } from "@/app/actions/venues";
import { getAITextResponse } from "@/app/actions/openAIBridge";
import { $createParagraphNode, $createTextNode, $getRoot } from "lexical";

interface Props {
    savePost:Function,
    user: User,
    posttype?: string,
    edited?: boolean,
    post?:Partial<Post>
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
    postfiletype: z.string().optional(),
    postfileObj: z.any().optional(),
    eventid: z.number().optional(),
    eventname: z.string().optional(),
    eventdate: z.date().nullable().optional(),
    venuename: z.string().optional(),
    address: z.string().optional(),
    venueid: z.number().optional(),
    // privatepost: z.boolean().optional(), 
})

const PostForm = ({user, edited, savePost, post}: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const [tempImage, setTempImage] = useState<OptimizedFile | undefined>();
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [saved, setSaved] = useState<boolean>(false);
    const [isAIIfied, setIsAIIfied] = useState<boolean>(false);
    const [venueQuery, setVenueQuery] = useState(post?.venues?.venuename ?? post?.venuename ?? '');
    const [venueSuggestions, setVenueSuggestions] = useState<VenueSuggestion[]>([]);
    const [isVenueSearchOpen, setIsVenueSearchOpen] = useState(false);
    const [isVenueSearching, setIsVenueSearching] = useState(false);
    const contentBackup = useRef<string[]>([]);
    const editorRef:any = useRef(null);
    const parentPostId = post?.parentPostId !== undefined ? post.parentPostId.toString() : undefined;
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
        venueid
    }

    const { register, handleSubmit, setValue, control, reset, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues
    })
    const venuenameRegistration = register('venuename')

    const sendFile = async (filedata:{file:File, userdir:string}) => {
        const {file, userdir} = filedata;
        await uploadFile({file, userdir});
    }

    const normalizeOptionalValue = (value?: string) => {
        const normalized = value?.trim()

        return normalized ? normalized : undefined
    }

    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        setIsSaving(true);

        if (post && post.id) {
            values.id = post.id;
        }

        if (parentPostId) {
            values.parentPostId = parentPostId;
        }

        if (values.content && values.content.html && values.content.lexical) {
            const {html, lexical} = values.content;
            values.content = html;
            values.lexical = JSON.stringify(lexical);
        }

        values.eventname = normalizeOptionalValue(values.eventname)
        values.venuename = normalizeOptionalValue(values.venuename)
        values.address = normalizeOptionalValue(values.address)

        let userdir, postfileUrl;

        if (user && user.userdetails)
            userdir = user.userdetails.userdir;

        if (tempImage && userdir) {
            const res = await fetch(tempImage.url);
            const blob = await res.blob();
            const file = new File([blob], tempImage.name, {type: tempImage.type})
            const formData = new FormData();
            formData.append('file', file);
            formData.append('userdir', userdir);

            sendFile({file, userdir});

            postfileUrl = file.name;
            values.postfile = postfileUrl;
            values.postfiletype = file.type;
        }

        await savePost(values);
        
        if (post && post.id) {
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
            setTempImage(undefined);
        }
    }

    const setTempFile = async (file:File) => {
        if (file) {
            const fileObj:OptimizedFile = {
                name: '',
                type:'',
                url:''
            };

            let fileUrl;

            if (file.type.match(/image/)) {
                fileUrl = await compressImage(file);
                fileObj.type = 'image/webp';
                fileObj.name = file.name.split('.')[0] +'.webp';
            } else if (file.type.match(/audio/)){
                fileUrl = URL.createObjectURL(file);
                fileObj.type = file.type;
                fileObj.name = file.name;
            }

            fileObj.url = fileUrl || '';

            setTempImage(fileObj);
        }
    }

    const setPostFile = () => {
        if (postfile && post?.userdetails?.userdir) {
            setTempImage({
                name: postfile,
                type: post?.filetypes?.filetype ?? post?.filetype,
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

    const aiIfy = async () => {
        if (!editorRef.current) {
            return;
        }

        const text = editorRef.current.getEditorState().read(() => $getRoot().getTextContent().trim());

        if (!text) {
            return;
        }

        setIsSaving(true);
        contentBackup.current.push(text);
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const object = objects[Math.floor(Math.random() * objects.length)];
        const adjective2 = adjectives[Math.floor(Math.random() * adjectives.length)];
        const adjective3 = adjectives[Math.floor(Math.random() * adjectives.length)];
        const article = /^[aeiou]/i.test(adjective) ? 'an' : 'a';
        const article2 = /^[aeiou]/i.test(adjective2) ? 'an' : 'a';
        const prompt = `You are a ${adjective} ${subject} with a ${adjective2} ${object}. Write a ${adjective3} tweet about ${text}. Do not use emojis.`

        try {
            const res = await getAITextResponse(prompt);

            editorRef.current.update(() => {
                const root = $getRoot();
                const lines = res.split(/\r?\n/);

                root.clear();

                lines.forEach((line) => {
                    const paragraph = $createParagraphNode();

                    if (line.length > 0) {
                        paragraph.append($createTextNode(line));
                    }

                    root.append(paragraph);
                });
                const paragraph = $createParagraphNode();
                const note = $createTextNode(`Post formatted by AI pretending to be ${article} ${adjective} ${subject} with ${article2} ${adjective2} ${object}.`);
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
                    <div>
                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Title</div>
                                <input
                                    {...register('eventname')}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                    placeholder={`What's cookin'`}
                                />
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Date & Time</div>
                                <Controller
                                    control={control}
                                    name='eventdate'
                                    render={({ field }) => (
                                        <DatePicker
                                            selected={field.value || null}
                                            onChange={(date:Date | null) => field.onChange(date)}
                                            showTimeSelect
                                            showIcon
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                            icon={<BiCalendar />}
                                        />
                                    )}
                                />
                            </div>
                        </div>

                        <div className="mb-4 grid gap-4 md:grid-cols-2">
                            <div>
                                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Venue</div>
                                <div className="relative">
                                    <input
                                        {...venuenameRegistration}
                                        className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                        placeholder="ArtsQuest, The Funhouse, Godfrey Daniels, etc."
                                        autoComplete="off"
                                        onChange={(event) => {
                                            venuenameRegistration.onChange(event);
                                            setValue('venueid', undefined, { shouldDirty: true });
                                            setVenueQuery(event.target.value);
                                            setIsVenueSearchOpen(true);
                                        }}
                                        onFocus={() => setIsVenueSearchOpen(true)}
                                        onBlur={() => {
                                            window.setTimeout(() => setIsVenueSearchOpen(false), 150);
                                        }}
                                    />
                                    <input type="hidden" {...register('venueid')} />
                                    {isScheduledPost && isVenueSearchOpen && (venueSuggestions.length > 0 || isVenueSearching) &&
                                        <div className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">
                                            {isVenueSearching &&
                                                <div className="px-3 py-2 text-sm text-gray-500">Searching venues...</div>
                                            }
                                            {!isVenueSearching && venueSuggestions.map((venue) => (
                                                <button
                                                    key={venue.id}
                                                    type="button"
                                                    className="block w-full px-3 py-2 text-left hover:bg-orange/10"
                                                    onMouseDown={(event) => event.preventDefault()}
                                                    onClick={() => selectVenue(venue)}
                                                >
                                                    <div className="text-sm font-semibold text-gray-900">{venue.venuename}</div>
                                                    {(venue.address || venue.neighborhood) &&
                                                        <div className="text-xs text-gray-500">
                                                            {[venue.address, venue.neighborhood].filter(Boolean).join(' | ')}
                                                        </div>
                                                    }
                                                </button>
                                            ))}
                                        </div>
                                    }
                                </div>
                            </div>
                            <div>
                                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Map Address</div>
                                <input
                                    {...register('address')}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2"
                                    placeholder="123 Main St., Bethlehem, PA"
                                />
                            </div>
                        </div>
                    </div>
                }

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
                {(tempImage) && (
                    <div className="flex justify-center">
                        {
                            (tempImage.type.match(/audio/)) ?
                                <audio src={tempImage.url} controls/>
                                :
                                <img src={tempImage.url}/>
                        }
                    </div>
                )
                }

                <div className="mt-2 flex flex-row p-4">
                    <div className="w-[50%]">
                        <MediaUpload register={register} setValue={setValue} setTempImage={setTempFile}/>
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

                        <button onClick={() => aiIfy()} type='button' className="bg-white border border-gray-500 me-2 px-2 py-2 rounded text-gray-500 uppercase font-semibold cursor-pointer disabled:bg-orange-200" disabled={(isSaving) ? true : false}>
                            AI-ify
                        </button>
    
                        <button type='submit' className="bg-orange px-2 py-2 rounded text-white uppercase font-semibold cursor-pointer disabled:bg-orange-200" disabled={(isSaving) ? true : false}>
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </form>
    )
}

export default PostForm
