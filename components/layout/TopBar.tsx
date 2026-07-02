import User from "@/lib/models/user"
import Nav from "./Nav"
import ThemeToggle from "./ThemeToggle"
import Avatar from "@/components/shared/Avatar"
import imageUrl from '@/constants/imageUrl'

const TopBar = (props: {theme?:'lvartsmusic', user?:User}) => {
    if (props.theme === 'lvartsmusic') {
        const userdetails = props.user?.userdetails;
        const avatar = (userdetails?.userdir && userdetails?.avatar) ?
            `${imageUrl}/${userdetails.userdir}/${userdetails.avatar}` :
            undefined;

        return (
            <header className="sticky top-0 z-20 border-b border-lvartsmusic-border bg-lvartsmusic-background/90 backdrop-blur">
                <div className="mx-auto flex h-16 w-full max-w-[1265px] items-center justify-between px-4">
                    <a href='/home' className="flex shrink-0 items-center gap-2.5">
                        <img
                            src='/logos/lvarts-artsy-paths.svg'
                            alt="Lehigh Valley Arts & Music"
                            className="h-10 w-10"
                        />
                        <span className="hidden text-lg font-extrabold tracking-tight text-lvartsmusic-foreground sm:block">
                            Lehigh Valley Arts &amp; Music
                        </span>
                    </a>

                    <nav className="hidden md:block">
                        <Nav user={props.user} theme="lvartsmusic" />
                    </nav>

                    <div className="flex shrink-0 items-center gap-1">
                        <ThemeToggle />
                        {userdetails &&
                            <a href="/profile" className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/10" title="Your profile">
                                <Avatar imageUrl={avatar} displayName={userdetails.displayname} handle={userdetails.handle} size="sm" />
                            </a>
                        }
                    </div>
                </div>
            </header>
        )
    }

    return (
        <nav className="block topbar md:hidden">
            <a
                href='/home'
                className="flex items-center gap-4"
            >
                <img
                    src='/logos/lvarts-artsy-paths.svg'
                    alt="Lehigh Valley Arts & Music"
                    className="max-w-762 w-full"
                />
            </a>
        </nav>
    )
}

export default TopBar