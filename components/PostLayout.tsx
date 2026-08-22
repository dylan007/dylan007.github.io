import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

interface PostLayoutProps {
  meta: PostMeta;
  prev: PostMeta | null;
  next: PostMeta | null;
  children: React.ReactNode;
}

export default function PostLayout({
  meta,
  prev,
  next,
  children,
}: PostLayoutProps) {
  return (
    <article className="max-w-[72ch] mx-auto px-6 py-12 font-departure">
      <header className="mb-10 pb-6 border-b border-rule space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          {meta.title}
        </h1>
        <time className="text-xs text-ink-mute block">
          Published: {meta.date}
        </time>
      </header>

      <div className="prose text-sm text-[var(--ink-body)]">{children}</div>

      <nav className="mt-16 flex justify-between border-t border-rule pt-6 text-xs text-ink-mute">
        {prev ? (
          <Link
            href={`/posts/${prev.slug}`}
            className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/posts/${next.slug}`}
            className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
