'use client'

import { useRef, useState } from "react";
import { BiSolidImageAdd } from "react-icons/bi";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

const MediaUpload = (props:{register:Function, setValue:Function, setTempImages:(files: File[]) => void, saved:boolean}) => {
    const [fileIsSet, setFileIsSet] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const postfileRegister = props.register('postfileObj');
    const galleryfileRegister = props.register('isgalleryfile');

    return (
        <div className="flex">
            <div className="rounded-sm w-[25px]">
                <input
                    {...postfileRegister}
                    ref={(element) => {
                        postfileRegister.ref(element);
                        fileInputRef.current = element;
                    }}
                    type="file"
                    className="hidden"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    multiple
                    onChange={(event) => {
                        const files = Array.from(event.target.files ?? []);
                        postfileRegister.onChange(event);
                        props.setValue('postfileObj', files[0], { shouldValidate: true });
                        props.setTempImages(files);
                        setFileIsSet(true)
                        // Lets the same file be chosen again after it was removed.
                        event.target.value = '';
                    }}
                />
                <button type="button" className="cursor-pointer" aria-label="Upload images" onClick={() => fileInputRef.current?.click()}>
                    <BiSolidImageAdd size={25} title="upload images" />
                </button>
            </div>
            
            {fileIsSet && !props.saved &&
                <div className="flex ms-2 mt-1">
                    <div>
                        <label className="switch">
                            <input type="checkbox"
                            {...galleryfileRegister}
                            onChange={(event) => {
                                galleryfileRegister.onChange(event);
                                props.setValue('isgalleryfile', event.target.checked);
                            }}
                            />
                            <span className="slider round"></span>
                        </label>
                    </div>
                    <div className="text-xs ms-1">
                        Add to gallery
                    </div>
                </div>
            }
        </div>
    )
}

export default MediaUpload
