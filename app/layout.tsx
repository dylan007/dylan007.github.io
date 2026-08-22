import type { Metadata } from "next";
import { Newsreader, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const serif = Newsreader({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const departure = localFont({
  src: "../public/fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio & Blog",
    template: "%s | Portfolio & Blog",
  },
  description: "Writing on software, systems, and engineering projects.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${mono.variable} ${departure.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased">
        <header className="px-6 py-4 border-b border-rule">
          <nav className="max-w-[72ch] mx-auto flex items-center justify-between text-sm font-departure tracking-tight">
            <Link
              href="/"
              className="font-semibold hover:opacity-80 transition-opacity"
            >
              shounak dey
            </Link>
            <div className="flex gap-6">
              <Link
                href="/projects"
                className="hover:text-[var(--accent)] transition-colors"
              >
                projects
              </Link>
              <Link
                href="/posts"
                className="hover:text-[var(--accent)] transition-colors"
              >
                blog
              </Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow">{children}</main>

        <footer className="px-6 py-8 mt-16 text-xs text-ink-mute font-departure border-t border-rule">
          <div className="max-w-[72ch] mx-auto text-right">
            © {new Date().getFullYear()} Shounak Dey
          </div>
        </footer>
      </body>
    </html>
  );
}
