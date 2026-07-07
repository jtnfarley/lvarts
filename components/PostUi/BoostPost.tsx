'use client'

import { useState } from 'react';
import { BiTrendingUp } from "react-icons/bi";
import { FeedRow } from '@/lib/models/initFeedRow';
import BoostCheckoutModal from './BoostCheckoutModal';

export default function BoostPost(props:{postData:FeedRow}) {
	const post:FeedRow = props.postData
	const [isOpen, setIsOpen] = useState(false);

    return (
		<>
			<button onClick={() => setIsOpen(true)} className='rounded-full p-2 text-lvartsmusic-muted transition-colors hover:bg-lvartsmusic-accent/10 hover:text-lvartsmusic-accent'>
				<BiTrendingUp className="h-4.5 w-4.5" />
			</button>
			{isOpen && <BoostCheckoutModal postData={post} onClose={() => setIsOpen(false)}/>}
		</>
    )
}
