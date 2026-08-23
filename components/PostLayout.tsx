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
    <article className="site-shell py-12">
      <Link
        href="/posts"
        className="mb-8 inline-flex items-center font-mono text-xs text-ink-mute transition-colors hover:text-[var(--accent)]"
      >
        ← Back to blog
      </Link>
      <header className="mb-10 pb-6 border-b border-rule space-y-2">
        <h1 className="text-3xl tracking-tight text-[var(--ink)]">
          {meta.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          <time className="font-mono text-xs text-ink-mute">
            Published: {meta.date}
          </time>
          {meta.status === "unpublished" && (
            <span className="font-mono rounded border border-[var(--accent-teal)] px-2 py-0.5 text-[11px] text-[var(--accent-teal)]">
              unpublished
            </span>
          )}
        </div>
      </header>

      <div className="prose text-sm text-[var(--ink-body)]">{children}</div>

      <nav className="mt-16 flex justify-between border-t border-rule pt-6 font-mono text-xs text-ink-mute">
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
