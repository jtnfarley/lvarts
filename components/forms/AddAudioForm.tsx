'use client'

import { useState } from "react";
import PostForm from "./PostForm";
import User from "@/lib/models/user";

interface Props {
    user: User
    savePost:Function
}

const AddEventForm = ({user, savePost}: Props) => {
    const [fileSelected, setFileSelected] = useState(false);
    const [addToRadio, setAddToRadio] = useState(false);

    return (
        <div className="bg-[#fcf9ef] rounded-lg p-5">
            <div className="mb-4 text-xl font-semibold">Add Audio Track to Streaming Radio</div>
            <div className="mb-4 text-sm text-gray-600">
                Add the MP3 file, track title, band name, and cover art to include in the streaming radio.
            </div>
            <PostForm
                user={user}
                post={{posttype:'audio'}}
                edited={false}
                savePost={savePost}
                onAudioFileSelected={setFileSelected}
                addToRadio={addToRadio}
            />
            {fileSelected && (
                <>
                    <div className="flex items-center gap-2 mb-3">
                        <label className="switch" aria-label="Add to streaming radio">
                            <input
                                type="checkbox"
                                checked={addToRadio}
                                onChange={(e) => setAddToRadio(e.target.checked)}
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
        </div>
    )
}

export default AddEventForm
