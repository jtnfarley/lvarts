'use client'

import Link from "next/link";
import { BiSolidMusic } from "react-icons/bi";

const AudioUploadLink = () => {
    return (
        <div className="flex">
            <div className="rounded-sm w-[25px]">
                <Link href='/audio-upload'><BiSolidMusic size={25} title="upload audio" /></Link>
            </div>
        </div>
    )
}

export default AudioUploadLink
