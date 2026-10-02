import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { getSiteUrl } from "@/lib/site-url";

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
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "DocRoute Student | University applications mapped",
    template: "%s | DocRoute Student",
  },
  description:
    "Explore European universities and build a source-linked route from application documents to student residence.",
  applicationName: "DocRoute Student",
  keywords: [
    "European universities",
    "university application",
    "admission documents",
    "student residence",
    "study in Europe",
  ],
  openGraph: {
    type: "website",
    siteName: "DocRoute Student",
    title: "DocRoute Student",
    description:
      "One source-linked route from university application to student residence.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "DocRoute Student",
    description:
      "One source-linked route from university application to student residence.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
