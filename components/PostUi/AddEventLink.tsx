'use client'

import Link from "next/link";
import { BiCalendarPlus } from "react-icons/bi";

const AddEventLink = () => {
    return (
        <div className="flex">
            <div className="rounded-sm w-[25px]">
                <Link href='/calendar/add-event'><BiCalendarPlus size={25} title="add an event" /></Link>
            </div>
        </div>
    )
}

export default AddEventLink
