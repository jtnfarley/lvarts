import { Inter } from "next/font/google";
import { Metadata } from "next";
import TopBar from "@/components/layout/TopBar";
import LeftSidebar from "@/components/layout/LeftSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import BottomBar from "@/components/layout/BottomBar";

export const metadata: Metadata = {
  title: "Lehigh Valley Arts & Music",
  description: "Lehigh Valley Arts Community Social Media",
};

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  	children,
}: Readonly<{
  	children: React.ReactNode;
}>) {

	return (
		<div>
			<TopBar/>
			<main className="flex flex-row">
				<LeftSidebar/>
				<section className="main-container">
					<div className="flex flex-col w-full md:w-lg min-h-screen">
						{children}
					</div>
				</section>
				<RightSidebar/>
			</main>
			<BottomBar/>
		</div>	
	);
}
