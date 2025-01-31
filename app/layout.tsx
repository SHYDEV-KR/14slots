import { BottomNav } from "@/components/bottom-nav";
import { Header } from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

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
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "14 Slots Time Management",
    description: "14개의 슬롯으로 시간을 관리하는 효율적인 시간 관리 도구입니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "14 Slots",
    images: [
      {
        url: "/logo.svg",
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
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <Script
          id="register-sw"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js');
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="14slots-theme"
        >
          <Header />
          <div className="pb-24">
            {children}
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
