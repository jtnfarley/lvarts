'use client'

import ImageUpload from "./MediaUpload"

const PostFormActions = (props:{register:Function, setValue:Function, setTempImage:Function}) => {
    return (
        <div className="mt-2 flex flex-row">
            <div className="w-[50%]">
                <ImageUpload register={props.register} setValue={props.setValue} setTempImage={props.setTempImage}/>
            </div>
            <div className="w-[50%] flex justify-end">
                <button type='submit' className="bg-orange px-2 py-2 rounded text-white uppercase font-semibold">
                    Post
                </button>
            </div>
        </div>
    )
}

export default PostFormActions