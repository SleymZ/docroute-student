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
    default: "DocRoute | Your move to Europe, mapped",
    template: "%s | DocRoute",
  },
  description:
    "Find European universities, the documents you need and the deadlines for each one, with a source-linked route from application to residence permit.",
  applicationName: "DocRoute",
  keywords: [
    "European universities",
    "university application",
    "admission documents",
    "student residence",
    "study in Europe",
    "move to Europe",
    "residence permit",
  ],
  openGraph: {
    type: "website",
    siteName: "DocRoute",
    title: "DocRoute",
    description:
      "One source-linked route from university application to residence permit, with deadlines for every document.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "DocRoute",
    description:
      "One source-linked route from university application to residence permit, with deadlines for every document.",
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
