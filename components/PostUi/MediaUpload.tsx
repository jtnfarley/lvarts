'use client'

import { BiSolidFilePlus } from "react-icons/bi";

const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'audio/mpeg'];

const MediaUpload = (props:{register:Function, setValue:Function, setTempImage:Function}) => {
    const postFileRegister = props.register('postFileObj')

    return (
        <div className=" bg-white rounded-sm w-[40px]">
            <input 
                {...postFileRegister}
                type="file"
                id="postFileObj"
                className="hidden"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    postFileRegister.onChange(event);
                    props.setValue('postFileObj', file, { shouldValidate: true });
                    props.setTempImage(file);
                }}
            />
            <label htmlFor="postFileObj" className="cursor-pointer">
                <BiSolidFilePlus size={40} title="upload an image" />
            </label>
        </div>
    )
}

export default MediaUpload
