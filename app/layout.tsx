import { Metadata } from "next";
import { GoogleAnalytics } from '@next/third-parties/google'

import './globals.css'
import RandoBgs from "@/components/layout/RandoBgs";
import { ModalProvider } from '@/app/contextProviders/modalProvider'
import { ModalRoot } from '@/components/Modal/ModalRoot'
import Radio from '@/components/Radio/RadioServer';

export const metadata: Metadata = {
  title: "Lehigh Valley Art & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

// Applies the persisted theme to the document root before paint, so it
// survives client-side navigation between route groups (nested layouts
// remount on navigation and their inline scripts don't re-run, but the
// <html> element here never unmounts).
// Dark is the default; only an explicit 'light' choice in localStorage opts out.
// If no choice has been made yet, persist 'dark' so the default is explicit from the first load.
const themeInitScript = `(function(){try{var t=localStorage.getItem('lvartsmusic-theme');if(!t){t='dark';localStorage.setItem('lvartsmusic-theme',t);}if(t==='light')document.documentElement.classList.remove('dark');}catch(e){}})();`;

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	return (
		<ModalProvider>
			<html className='dark' lang="en" data-theme="lvartsmusic" suppressHydrationWarning>
				<head>
					<GoogleAnalytics gaId="G-J6PQBNCBKC" />
					<script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
				</head>
				<body>
					<RandoBgs/>

					<main className='lg:flex lg:justify-center'>
						<div className="lg:w-full">
							{children}
						</div>
					</main>
					<Radio/>
					<ModalRoot/>
				</body>
			</html>
		</ModalProvider>
	);
}
