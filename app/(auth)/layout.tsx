import { Inter } from "next/font/google";
import { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import '../globals.css'

export const metadata: Metadata = {
  title: "The 610",
  description: "Lehigh Valley Arts Community Social Media",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
        <ClerkProvider>
            <body className={`${inter.className}`}>
                <div className="w-full flex justify-center items-center min-h-screen">
                    {children}
                </div>
            </body>
        </ClerkProvider>
    </html>
  );
}
