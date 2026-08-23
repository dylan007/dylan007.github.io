import Link from "next/link";
import type { ProjectMeta } from "@/lib/projects";

interface ProjectLayoutProps {
  meta: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
  children: React.ReactNode;
}

export default function ProjectLayout({
  meta,
  prev,
  next,
  children,
}: ProjectLayoutProps) {
  return (
    <article className="site-shell py-12">
      <header className="mb-10 pb-6 border-b border-rule space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl tracking-tight text-[var(--ink)]">
            {meta.title}
          </h1>
          {meta.link && meta.link !== "#" && (
            <a
              href={meta.link}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-xs px-3 py-1 rounded border border-rule bg-card hover:border-[var(--accent)] transition-colors"
            >
              External Link ↗
            </a>
          )}
        </div>
        <p className="text-sm text-[var(--ink-body)]">
          {meta.description}
        </p>
        <div className="flex gap-2 pt-1">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-departure px-2 py-0.5 rounded bg-[var(--bg)] border border-rule text-ink-mute"
            >
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose text-sm text-[var(--ink-body)]">{children}</div>

      <nav className="mt-16 flex justify-between border-t border-rule pt-6 font-mono text-xs text-ink-mute">
        {prev ? (
          <Link
            href={`/projects/${prev.slug}`}
            className="hover:text-[var(--accent)] transition-colors flex items-center gap-1"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/projects/${next.slug}`}
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
