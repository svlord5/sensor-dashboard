import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "track&lost - Device Monitor",
  description: "Advanced device tracking and monitoring dashboard",
};

import { Providers } from "../components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="flex-1">
              {children}
            </div>
            <footer className="py-8 flex items-center justify-center gap-3 border-t border-border/40 bg-background/50">
              <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 ring-1 ring-border shadow-sm">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Suraj&backgroundColor=e2e8f0" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center gap-2 text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">
                <span className="text-muted-foreground/70">Developed By</span>
                <span className="text-foreground/90 border-b border-border/60 pb-0.5">Suraj Vishwanath</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
