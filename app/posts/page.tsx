import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-[72ch] mx-auto px-6 py-12 font-departure space-y-8">
      <header className="space-y-2 pb-6 border-b border-rule">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          All Posts
        </h1>
        <p className="text-xs text-ink-mute">
          Writing on software, systems, and engineering.
        </p>
      </header>

      {posts.length > 0 ? (
        <div className="divide-y divide-rule">
          {posts.map((post, idx) => (
            <div
              key={post.slug}
              className="py-4 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4 group"
            >
              <Link
                href={`/posts/${post.slug}`}
                className="font-medium text-base text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-3"
              >
                <span className="text-xs text-ink-mute w-6">
                  {String(idx + 1).padStart(2, "0")}.
                </span>
                <span>{post.title}</span>
              </Link>
              <time className="text-xs text-ink-mute whitespace-nowrap">
                {post.date}
              </time>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-mute italic">No posts found.</p>
      )}
    </div>
  );
}
