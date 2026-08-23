"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { PostMeta } from "@/lib/posts";

export default function PostFilters({ posts }: { posts: PostMeta[] }) {
  const searchParams = useSearchParams();
  const selectedTag = searchParams.get("tag");
  const tags = Array.from(new Set(posts.flatMap((post) => post.tags))).sort();
  const filteredPosts = selectedTag
    ? posts.filter((post) => post.tags.includes(selectedTag))
    : posts;

  return (
    <>
      {tags.length > 0 && (
        <nav className="flex flex-wrap gap-2" aria-label="Filter posts by tag">
          <Link
            href="/posts"
            className={`font-mono rounded border px-2.5 py-1 text-xs transition-colors ${
              !selectedTag
                ? "filter-active-primary"
                : "filter-option border-rule text-ink-mute"
            }`}
          >
            All
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/posts?tag=${encodeURIComponent(tag)}`}
              className={`font-mono rounded border px-2.5 py-1 text-xs transition-colors ${
                selectedTag === tag
                  ? "filter-active-secondary"
                  : "filter-option border-rule text-ink-mute"
              }`}
            >
              {tag}
            </Link>
          ))}
        </nav>
      )}

      {filteredPosts.length > 0 ? (
        <div className="divide-y divide-rule">
          {filteredPosts.map((post, idx) => (
            <div
              key={post.slug}
              className="py-4 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4 group"
            >
              <div className="min-w-0">
                <Link
                  href={`/posts/${post.slug}`}
                  className="font-medium text-lg text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-3"
                >
                  <span className="font-mono text-xs text-ink-mute w-6">
                    {String(idx + 1).padStart(2, "0")}.
                  </span>
                  <span>{post.title}</span>
                </Link>
                {post.tags.length > 0 && (
                  <div className="ml-9 mt-2 flex flex-wrap gap-2">
                    {post.tags.map((postTag) => (
                      <Link
                        key={postTag}
                        href={`/posts?tag=${encodeURIComponent(postTag)}`}
                        className="font-mono text-[11px] text-ink-mute transition-colors hover:text-[var(--accent)]"
                      >
                        #{postTag}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <time className="font-mono text-xs text-ink-mute whitespace-nowrap">
                {post.date}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-mute italic">
          {selectedTag ? `No posts tagged “${selectedTag}”.` : "No posts found."}
        </p>
      )}
    </>
  );
}
