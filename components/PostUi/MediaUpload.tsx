'use client'

import { BiSolidFilePlus } from "react-icons/bi";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg'];

const MediaUpload = (props:{register:Function, setValue:Function, setTempImage:Function}) => {
    const postfileRegister = props.register('postfileObj')

    return (
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
                }}
            />
            <label htmlFor="postfileObj" className="cursor-pointer">
                <BiSolidFilePlus size={25} title="upload an image" />
            </label>
        </div>
    )
}

export default MediaUpload
