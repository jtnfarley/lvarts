import Link from "next/link"

const TopBar = () => {
    return (
        <nav className="block topbar md:hidden">
            <Link
                href='/home'
                className="flex items-center gap-4"
            >
                <img
                    src='/logos/lvarts-paths.svg'
                    alt="Lehigh Valley Arts & Music"
                    className="max-w-762 w-full"
                />
            </Link>
        </nav>
    )
}

export default TopBar