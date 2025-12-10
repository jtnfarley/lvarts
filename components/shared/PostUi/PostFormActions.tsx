'use client'

import { BiImageAdd } from "react-icons/bi";

const PostFormActions = () => {
    return (
        <div className="mt-2 flex flex-row">
            <div className="w-[50%]">
                <input type="file" name="postFile" id="postFile" className="hidden" />
                <label htmlFor="postFile" className="cursor-pointer">
                    <BiImageAdd size={40} title="upload an image" />
                </label>
            </div>
            <div className="w-[50%] flex justify-end">
                <button type='submit' className="bg-orange px-2 py-2 rounded text-white">
                    Post
                </button>
            </div>
        </div>
    )
}

export default PostFormActions