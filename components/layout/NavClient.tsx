'use client'

import { BiSolidHomeAlt2, BiImage, BiSolidBell, BiSolidCalendar,  BiArrowFromLeft, BiSolidCircle } from "react-icons/bi";
import Link from "next/link"
import { usePathname } from "next/navigation"
import User from "@/lib/models/user";
import { useEffect, useState } from "react";
import SignOut from '@/components/auth/buttons/SignOut';
import { cn } from "@/lib/utils";

const navLinks = [
	{ href: '/home', label: 'Home', icon: BiSolidHomeAlt2 },
	{ href: '/notifications', label: 'Notifications', icon: BiSolidBell },
	{ href: '/calendar', label: 'Calendar', icon: BiSolidCalendar },
	{ href: '/gallery', label: 'Art Gallery', icon: BiImage },
]

export default function NavClient(props: {user?:User, hasNotis:boolean, hasNewNotifications:Function, shade?:string, theme?:'lvartsmusic'}) {
	const {user, hasNewNotifications, theme} = props;
	const [hasNotis, setHasNotis] = useState<boolean>(props.hasNotis);
	const shadeClass = (props.shade && props.shade === 'dark') ? "leftIcon_dark" : "leftIcon";
	const pathname = usePathname();

	const checkNotis = async () => {
		const newNotis = await hasNewNotifications(user?.id);
		setHasNotis(newNotis);
	}

	useEffect(() => {
		const interval = setInterval(checkNotis, 60000)

		return () => {
			clearInterval(interval);
		}
	}, [])

	if (theme === 'lvartsmusic') {
		return (
			<div className='flex items-center gap-1'>
				{user && navLinks.map(({ href, label, icon: Icon }) => {
					const active = pathname === href;

					return (
						<Link
							key={href}
							href={href}
							title={label}
							onClick={() => href === '/notifications' && setHasNotis(false)}
							className={cn(
								'relative rounded-full p-2.5 transition-colors',
								active
									? 'bg-lvartsmusic-accent text-lvartsmusic-accent-foreground'
									: 'text-lvartsmusic-muted hover:bg-black/5 dark:hover:bg-white/10'
							)}
						>
							<Icon className="h-5 w-5" />
							{label === 'Notifications' && hasNotis &&
								<div className="absolute top-1 right-1"><BiSolidCircle color='red' className="h-2 w-2" /></div>
							}
						</Link>
					)
				})}
				{user && <SignOut shade={props.shade}/>}
			</div>
		)
	}

	return (
		<div className='flex gap-8 justify-center items-center md:mb-6'>
			{user ?
				<>
					<Link href="/home" className={`leftsidebar_link flex flex-row items-center`} title="Home">
						<div className="relative">
							<BiSolidHomeAlt2 className={shadeClass}/>
						</div>
					</Link>
					<Link href="/notifications" className={`leftsidebar_link flex flex-row items-center`} title="Notifications" onClick={() => setHasNotis(false)}>
						<div className="relative">
							<BiSolidBell className={shadeClass}/>
							{hasNotis &&
								<div className="absolute top-[20%] right-0"><BiSolidCircle color='red'/></div>
							}
						</div>
					</Link>
					<Link href="/calendar" className={`leftsidebar_link flex flex-row items-center`} title="Calendar">
						<div className="relative">
							<BiSolidCalendar className={shadeClass}/>
						</div>
					</Link>
					<Link href="/gallery" className={`leftsidebar_link flex flex-row items-center`} title="Art Gallery">
						<div className="relative">
							<BiImage className={shadeClass}/>
						</div>
					</Link>
					{user &&
						<>
							<div>
								<SignOut shade={props.shade}/>
							</div>
						</>
					}
				</>
				:
				<Link href='/' className='leftsidebar_link flex flex-row items-center'>
					<p className="hidden text-gray-500 text-lg md:block me-4">Sign In</p>
					<div className="relative">
						<BiArrowFromLeft />
					</div>
				</Link>
			}

		</div>
	)
}
