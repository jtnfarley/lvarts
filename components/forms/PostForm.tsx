'use client'

import { Controller, useForm } from "react-hook-form";
import * as z from 'zod'
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";

import RTEditor from "./Fields/RichTextEditor/RTEditor";
import User from "@/lib/models/user";
import MediaUpload from "@/components/PostUi/MediaUpload"
import { Spinner } from "../layout/Spinner";
import AudioUploadLink from "../PostUi/AudioUploadLink";
import AddEventLink from "../PostUi/AddEventLink";
import EventFields from "./Fields/EventFields";
import AudioFields from "./Fields/AudioFields";
import { FeedRow } from "@/lib/models/initFeedRow";
import { useFileUpload } from "./hooks/useFileUpload";
import { useVenueSearch } from "./hooks/useVenueSearch";
import { useAIIfy } from "./hooks/useAIIfy";
import PostTypeSelector from "./PostTypeSelector";
import ImageStrip from "./ImageStrip";
import { BiSolidMagicWand } from "react-icons/bi";

interface Props {
    savePost: Function,
    user: User,
    posttype?: string,
    edited?: boolean,
    post?: Partial<FeedRow>,
    onAudioFileSelected?: (selected: boolean) => void,
    addToRadio?: boolean,
    allowTypeSwitch?: boolean,
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
}).superRefine((data, ctx) => {
    if (data.posttype === 'audio') {
        if (!data.trackname?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Track title is required', path: ['trackname'] });
        }
        if (!data.artist?.trim()) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Artist name is required', path: ['artist'] });
        }
    }
});

const PostForm = ({ user, edited, savePost, post, onAudioFileSelected, addToRadio, allowTypeSwitch }: Props) => {
    const [clearEditor, setClearEditor] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [fileSelectedForRadio, setFileSelectedForRadio] = useState(false);
    const [internalAddToRadio, setInternalAddToRadio] = useState(addToRadio ?? false);
    const editorRef = useRef<any>(null);

    const resolvedPostType = post?.posttype ?? post?.posttypes?.posttype ?? 'post';
    const [activeType, setActiveType] = useState(resolvedPostType);
    const isScheduledPost = activeType === 'event';

    const parentPostId = post?.parentPostId !== undefined ? post.parentPostId?.toString() : undefined;

    const defaultValues = {
        // Keep the post's author when an admin edits it; savePost only honors this for admins.
        userdetailsid: post?.userdetails?.id ?? user.userdetails?.id,
        posttype: resolvedPostType,
        edited: edited ?? false,
        parentPostId,
        id: post?.id ?? undefined,
        content: post?.lexical ?? "",
        eventid: post?.eventid ?? undefined,
        eventname: post?.eventname ?? '',
        eventdate: post?.eventdate ?? undefined,
        venuename: post?.venuename ?? '',
        address: post?.address ?? '',
        venueid: post?.venueid ?? undefined,
        trackname: post?.audio?.trackname ?? undefined,
        artist: post?.audio?.artist ?? undefined,
        album: post?.audio?.album ?? undefined,
        releaseyear: post?.audio?.releaseyear ?? undefined,
        coverartfile: post?.audio?.coverartfile ?? undefined,
        addToRadio,
    };

    const { register, handleSubmit, setValue, control, reset, formState: { errors, isSubmitSuccessful } } = useForm<z.infer<typeof PostValidation>>({
        resolver: zodResolver(PostValidation),
        defaultValues,
    });

    const { tempFile, images, addImages, removeImage, moveImage, clearFiles, uploadError, setUploadError, setupTempFile, handleUpload } = useFileUpload(post, user, internalAddToRadio);

    const { setVenueQuery, venueSuggestions, isVenueSearchOpen, setIsVenueSearchOpen, isVenueSearching, selectVenue, resetVenueSearch } =
        useVenueSearch(isScheduledPost, post?.venuename ?? '', setValue);

    const { isAIIfied, showTones, setShowTones, boringAdjectives, aiIfy, resetPost } = useAIIfy(setIsSaving);

    const handleTypeChange = (type: string) => {
        setActiveType(type);
        setValue('posttype', type);
        if (type !== 'audio') {
            setInternalAddToRadio(false);
            setValue('addToRadio', false);
        }
        if (type !== 'event') {
            setValue('venueid', undefined);
        }
    };

    const venuenameRegistration = register('venuename');

    const normalizeOptionalValue = (value?: string) => {
        const normalized = value?.trim();
        return normalized ? normalized : undefined;
    };

    const onSubmit = async (values: z.infer<typeof PostValidation>) => {
        setUploadError(null);
        setIsSaving(true);

        if (post?.id) values.id = post.id;
        if (parentPostId) values.parentPostId = parentPostId;

        if (values.content?.html && values.content.lexical) {
            const { html, lexical } = values.content;
            values.content = html;
            values.lexical = JSON.stringify(lexical);
        }

        values.eventname = normalizeOptionalValue(values.eventname);
        values.venuename = normalizeOptionalValue(values.venuename);
        values.address = normalizeOptionalValue(values.address);

        try {
            const uploadResult = await handleUpload(values);
            Object.assign(values, uploadResult);
        } catch (error: any) {
            console.error('Upload failed', error);
            const is413 = error?.statusCode === 413 || error?.message?.includes('Body exceeded');
            const reason = error instanceof Error ? ` (${error.message})` : '';
            setUploadError(is413 ? 'File is too large. Please upload an MP3 under 10MB.' : `Upload failed${reason}. Please try again.`);
            setIsSaving(false);
            return;
        }

        // Strip file objects after upload — only the filename is needed server-side.
        // Passing raw File / base64 data URLs to a server action blows Vercel's 4.5MB limit.
        delete (values as any).postfileObj;
        if (values.coverartfile?.name) {
            values.coverartfile = { name: values.coverartfile.name };
        }

        if (values.posttype === 'audio') {
            values.posttype = 'post';
        }

        await savePost(values);

        if (post?.id) {
            dispatchEvent(new CustomEvent("postsUpdated", { detail: { action: 'edit', postid: post.id } }));
        } else {
            dispatchEvent(new Event('postsUpdated'));
        }

        setIsSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        if (!post?.id) {
            setClearEditor(true);
            clearFiles();
        }
    };

    useEffect(() => {
        if (isSubmitSuccessful && !post?.id) {
            reset(defaultValues);
            resetVenueSearch();
        }
    }, [isSubmitSuccessful, post?.id]);

    useEffect(() => {
        const handleEditorUpdated = () => setClearEditor(false);
        window.addEventListener('editorUpdated', handleEditorUpdated);
        return () => window.removeEventListener('editorUpdated', handleEditorUpdated);
    }, []);

    const handleSetupTempFile = async (file: File) => {
        await setupTempFile(file);
        if (file?.type.match(/audio/)) {
            setFileSelectedForRadio(true);
            onAudioFileSelected?.(true);
        }
    };

    const aiIfyControls = (
        <>
            {isAIIfied && (
                <button onClick={() => resetPost(editorRef)} type='button' className="bg-white border border-gray-500 px-2.5 py-0.5 rounded-full text-gray-500 uppercase font-semibold cursor-pointer text-xs">
                    Reset
                </button>
            )}
            <div className="relative">
                {showTones && (
                    <>
                        <div className="fixed inset-0 z-10" aria-hidden="true" onClick={() => setShowTones(false)} onKeyDown={(e) => e.key === 'Escape' && setShowTones(false)} />
                        <div className="absolute top-full mt-2 right-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-82 max-w-[calc(100vw-3rem)]">
                            <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Pick a tone</div>
                            <div className="flex flex-wrap gap-2">
                                {boringAdjectives?.map((adjective) => (
                                    <button
                                        key={adjective}
                                        type="button"
                                        onClick={() => aiIfy(editorRef, adjective)}
                                        className="px-3 py-1 rounded-full bg-gray-100 hover:bg-orange hover:text-white text-sm font-medium text-gray-700 transition-colors capitalize cursor-pointer"
                                    >
                                        {adjective}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
                <button
                    onClick={() => setShowTones(!showTones)}
                    type='button'
                    className="flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:text-orange cursor-pointer disabled:opacity-50"
                    disabled={isSaving}
                    aria-label="AI-ify your post"
                    title="AI-ify"
                >
                    <BiSolidMagicWand size={20} />
                </button>
            </div>
        </>
    );

    return (
        <form onSubmit={handleSubmit(onSubmit, (errors) => console.log('Zod validation errors:', errors))}>
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

                {activeType === 'audio'
                    ? <AudioFields register={register} control={control} setValue={setValue} setupTempFile={handleSetupTempFile} clearEditor={clearEditor} errors={errors} />
                    : <Controller
                        control={control}
                        name='content'
                        render={({ field }) => (
                            <RTEditor
                                ref={editorRef}
                                onChange={field.onChange}
                                clearEditor={clearEditor}
                                content={post?.lexical ?? ""}
                                currentUserDetailsId={user?.userdetails?.id || 0}
                                toolbarExtras={aiIfyControls}
                            />
                        )}
                    />
                }

                {tempFile?.type.match(/audio/) && (
                    <div className="flex justify-center">
                        <audio src={tempFile.url} controls />
                    </div>
                )}

                {activeType !== 'audio' && !tempFile && images.length > 0 && (
                    <ImageStrip images={images} onRemove={removeImage} onMove={moveImage} />
                )}

                {uploadError && (
                    <div className="mx-4 mb-2 rounded bg-red-100 border border-red-400 px-3 py-2 text-sm text-red-700">
                        {uploadError}
                    </div>
                )}

                {activeType === 'audio' && fileSelectedForRadio && (
                    <>
                        <div className="flex items-center gap-2 mb-3">
                            <label className="switch" aria-label="Add to streaming radio">
                                <input
                                    type="checkbox"
                                    checked={internalAddToRadio}
                                    onChange={(e) => {
                                        setInternalAddToRadio(e.target.checked);
                                        setValue('addToRadio', e.target.checked);
                                    }}
                                />
                                <span className="slider round"></span>
                            </label>
                            <div className="text-xs">Add to streaming radio</div>
                        </div>
                        <div className="text-sm italic" id="toc">
                            By uploading, you attest that you are the copyright owner of the selected track, and you grant LVArtandMusic.com non-exclusive rights to stream your track for promotional purposes without royalties or compensation.
                        </div>
                    </>
                )}

                {allowTypeSwitch && (
                    <div className="mt-2 px-4 flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Post Type:</span>
                        <PostTypeSelector activeType={activeType} onChange={handleTypeChange} />
                    </div>
                )}

                <div className={`${allowTypeSwitch ? '' : 'mt-2 '}flex items-center p-4 gap-2`}>
                    <div className="flex-1 min-w-0">
                        {activeType !== 'audio' && (
                            <div className="flex gap-3">
                                <MediaUpload register={register} setValue={setValue} setTempImages={addImages} saved={saved} />
                                {!allowTypeSwitch && (
                                    <>
                                        <AudioUploadLink />
                                        <AddEventLink />
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center shrink-0">
                        {isSaving && <div className="me-2"><Spinner /></div>}

                        {saved && (
                            <div className="me-2 bg-green-200 text-xs font-semibold uppercase text-green-700 border-1 border-green-700 px-2 py-1 rounded-sm"
                                style={{ opacity: 0, animation: 'fade-in-out 3s ease-in-out' }}>
                                {activeType === 'zine' ? 'Submitted for review' : 'Post Saved'}
                            </div>
                        )}

                        <button type='submit' className="bg-orange px-3.5 py-1.5 rounded-full text-white uppercase font-semibold cursor-pointer disabled:bg-orange-200 text-sm" disabled={isSaving}>
                            Post
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PostForm;
