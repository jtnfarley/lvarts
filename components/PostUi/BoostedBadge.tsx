import { BiTrendingUp } from "react-icons/bi";

export default function BoostedBadge() {
    return (
        <span className='inline-flex items-center gap-1 rounded-full bg-lvartsmusic-accent/10 px-2 py-0.5 text-xs font-semibold text-lvartsmusic-accent'>
            <BiTrendingUp className="h-3 w-3" />
            Boosted
        </span>
    )
}
