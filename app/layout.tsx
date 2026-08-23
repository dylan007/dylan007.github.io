import type { Metadata } from "next";
import { IBM_Plex_Mono, Lora } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const serif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

const departure = localFont({
  src: "../public/fonts/DepartureMono-Regular.woff2",
  variable: "--font-departure",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Shounak Dey — Software Engineer",
    template: "%s — Shounak Dey",
  },
  description:
    "Software engineer at Goldman Sachs. Writing about systems, software, and projects.",
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
        <header className="site-header">
          <nav className="site-shell site-nav" aria-label="Primary navigation">
            <Link
              href="/"
              className="site-brand"
            >
              shounak dey
            </Link>
            <div className="site-nav-links">
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

        <footer className="site-footer">
          <div className="site-shell text-right">
            © {new Date().getFullYear()} Shounak Dey
          </div>
        </footer>
      </body>
    </html>
  );
}
