import type { FeedRow } from '@/lib/models/initFeedRow';
import EventContent from './EventContent';

export default function EventUi(props:{post:FeedRow}) {
    return (
		<div className="event overflow-hidden rounded-lg border border-lvartsmusic-border shadow-md">
			<EventContent post={props.post} googleMapsApiKey={''}/>
		</div>
    )
}
