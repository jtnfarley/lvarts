import { Inter } from "next/font/google";
import { Metadata } from "next";
import '../globals.css'
import { auth } from '@/auth';
import SessionWrapper from "../../components/auth/SessionWrapper";
import TopBar from "@/components/shared/TopBar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import RightSidebar from "@/components/shared/RightSidebar";
import BottomBar from "@/components/shared/BottomBar";

export const metadata: Metadata = {
  title: "The 610",
  description: "Lehigh Valley Arts Community Social Media",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	const session = await auth()
	
	const user = session?.user

	if (!user) {
		return (
			<html lang="en">
				<body className={`${inter.className}`}>
					<div className="w-full flex justify-center items-center min-h-screen">
						{children}
					</div>
				</body>
			</html>
		)
	}

	return (
		<SessionWrapper>
			<html lang="en">
				<body>
					<main className={`${inter.className}`}>
						<TopBar/>
						<main className="flex flex-row">
							<LeftSidebar/>
							<section className="main-container">
								<div className="flex flex-col w-full md:w-lg justify-center min-h-screen">
									{children}
								</div>
							</section>
							<RightSidebar/>
						</main>
						<BottomBar/>
					</main>
				</body>
			</html>
		</SessionWrapper>
	);
}
