import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const geistSans = Geist({
 variable: "--font-geist-sans",
 subsets: ["latin"],
});

const geistMono = Geist_Mono({
 variable: "--font-geist-mono",
 subsets: ["latin"],
});

export const metadata: Metadata = {
 title: "AlresumeBuilder",
 description: "AI-powered resume builder",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html
 lang="id"
 className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
 suppressHydrationWarning
 >
 <body className="min-h-full flex flex-col bg-background text-foreground">
 <script
 dangerouslySetInnerHTML={{
 __html: `try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}`,
 }}
 />
 <Providers>{children}</Providers>
 </body>
 </html>
 );
}

