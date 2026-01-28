const TopBar = () => {
    return (
        <nav className="block topbar md:hidden">
            <a
                href='/home'
                className="flex items-center gap-4"
            >
                <img
                    src='/logos/lvarts-paths.svg'
                    alt="Lehigh Valley Arts & Music"
                    className="max-w-762 w-full"
                />
            </a>
            <div className='me-3 uppercase flex justify-end'>beta version 0.1.0</div>
        </nav>
    )
}

export default TopBar