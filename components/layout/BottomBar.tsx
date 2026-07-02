
import Nav from "./Nav";
import {isLoggedIn} from "@/app/data/currentUser";
import { cn } from "@/lib/utils";

export default async function BottomBar(props: {theme?:'lvartsmusic'}) {
	const user = await isLoggedIn();
	const isLvartsmusic = props.theme === 'lvartsmusic';

	return (
		<section className={cn('bottombar', isLvartsmusic && 'border-t border-lvartsmusic-border bg-lvartsmusic-background')}>
			<div className={cn('bottombar_container md:hidden', isLvartsmusic && 'bg-transparent p-2')}>
				{user &&
					<Nav user={user} theme={props.theme}/>
				}

			</div>
		</section>
	)
}
