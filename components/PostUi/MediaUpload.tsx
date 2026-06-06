'use client'

import { useState } from "react";
import { BiSolidFilePlus } from "react-icons/bi";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg'];

const MediaUpload = (props:{register:Function, setValue:Function, setTempImage:Function, saved:boolean}) => {
    const [fileIsSet, setFileIsSet] = useState<boolean>(false);
    const postfileRegister = props.register('postfileObj');
    const galleryfileRegister = props.register('isgalleryfile');

    return (
        <div className="flex">
            <div className=" bg-white rounded-sm w-[25px]">
                <input 
                    {...postfileRegister}
                    type="file"
                    id="postfileObj"
                    className="hidden"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={(event) => {
                        const file = event.target.files?.[0];
                        postfileRegister.onChange(event);
                        props.setValue('postfileObj', file, { shouldValidate: true });
                        props.setTempImage(file);
                        setFileIsSet(true)
                    }}
                />
                <label htmlFor="postfileObj" className="cursor-pointer">
                    <BiSolidFilePlus size={25} title="upload an image" />
                </label>
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
