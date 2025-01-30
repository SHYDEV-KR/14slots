import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "14 Slots Time Management",
  description: "14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.",
  keywords: ["시간관리", "14slots", "생산성", "루틴", "스케줄"],
  authors: [{ name: "shydev" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "14 Slots Time Management",
    description: "14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "14 Slots",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "14 Slots Time Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "14 Slots Time Management",
    description: "14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="14slots-theme"
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
