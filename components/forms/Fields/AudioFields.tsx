import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { BiSolidFilePlus, BiSolidMusic } from "react-icons/bi";
import { compressImage } from "@/lib/utils";
import OptimizedFile from "@/lib/models/optimizedFile";

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const AudioFields = (props: {
    register:Function,
    control:any,
    setValue:Function,
    setupTempFile:Function,
    clearEditor:boolean,
    errors?:any
}) => {
    const {
        register,
        control,
        setValue,
        setupTempFile,
        clearEditor,
        errors
    } = props;
    const postfileRegister = register('postfileObj');
    const [tempCoverArt, setTempCoverArt] = useState<string | null>();

    const setCoverArt = async (file:File | undefined) => {
        if (file) {
            const fileObj:OptimizedFile = {
                name: '',
                type:'',
                url:''
            };

            let fileUrl;

            fileUrl = await compressImage(file);
            fileObj.type = 'image/webp';
            fileObj.name = file.name.split('.')[0].replaceAll('(', '').replaceAll(')','') +'.webp';

            fileObj.url = fileUrl || '';

            setTempCoverArt(fileUrl);
            setValue('coverartfile', fileObj, { shouldValidate: true });
        }
    }

    useEffect(() => {
        const inputs = document.getElementsByTagName('input');
        for (const input of inputs) {
            input.value = '';
        }
        setTempCoverArt(undefined);
    },[clearEditor])

    return (
        <div>
            <div className="mb-4 grid gap-4 md:grid-cols-2">
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Track Title <span className="text-red-500">*</span></div>
                    <input
                        {...register('trackname', { required: 'Track title is required' })}
                        placeholder={`Let's Get Shirt-Faced`}
                        type='text'
                    />
                    {errors?.trackname && <p className="mt-1 text-xs text-red-500">{errors.trackname.message}</p>}
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Artist Name <span className="text-red-500">*</span></div>
                    <input
                        {...register('artist', { required: 'Artist name is required' })}
                        type='text'
                        placeholder={`The Happy Accidents`}
                    />
                    {errors?.artist && <p className="mt-1 text-xs text-red-500">{errors.artist.message}</p>}
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Album Name</div>
                    <input
                        {...register('album')}
                        type='text'
                        placeholder={`Death Before Disco`}
                    />
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Release Year</div>
                    <input
                        {...register('releaseyear', { setValueAs: (v: string) => v === '' ? undefined : Number.parseInt(v, 10) })}
                        type='text'
                        placeholder={`1979`}
                    />
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Cover Art</div>
                    <Controller
                        control={control}
                        name='coverartfile'
                        render={({ field }) => (
                            <input
                                {...register('coverartfile')}
                                type="file"
                                id="coverartfile"
                                className="hidden"
                                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                                onChange={(event) => {
                                    const file = event.target.files?.[0];
                                    field.onChange(event);
                                    setCoverArt(file);
                                }}
                            />
                        )}
                    />
                    <label htmlFor="coverartfile" className="cursor-pointer">
                        <BiSolidFilePlus size={25} title="upload an image" />
                    </label>
                    {
                        tempCoverArt &&
                        <img src={tempCoverArt} alt="Cover art preview" />
                    }
                </div>
                <div>
                    <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">Track File (.mp3 only, 10MB max)</div>
                    <input
                        {...postfileRegister}
                        type="file"
                        id="postfileObj"
                        className="hidden"
                        accept={'audio/mpeg'}
                        onChange={(event) => {
                            const file = event.target.files?.[0];
                            postfileRegister.onChange(event);
                            setValue('postfileObj', file, { shouldValidate: true });
                            setupTempFile(file);
                        }}
                    />
                    <label htmlFor="postfileObj" className="cursor-pointer">
                        <BiSolidMusic size={25} title="upload audio" />
                    </label>
                </div>
            </div>
        </div>
    )
}

export default AudioFields;
