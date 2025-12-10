
import Image from "next/image"
import Link from "next/link"

const TopBar = () => {
    return (
        <nav className="block topbar lg:hidden">
            <Link
                href='/home'
                className="flex items-center gap-4"
            >
                <Image
                    src='/logos/lvarts-paths.svg'
                    alt="Lehigh Valley Arts & Music"
                    width={500}
                    height={195}
                />
            </Link>
        </nav>
    )
}

export default TopBar