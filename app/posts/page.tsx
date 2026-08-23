import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import PostFilters from "@/components/PostFilters";

export default function PostsPage() {
  const posts = getAllPosts();

  return (
    <div className="site-shell py-12 space-y-8">
      <header className="space-y-2 pb-6 border-b border-rule">
        <h1 className="text-3xl tracking-tight text-[var(--ink)]">All Posts</h1>
        <p className="font-mono text-xs text-ink-mute">
          Writing on software, systems, and engineering.
        </p>
      </header>
      <Suspense fallback={<div className="h-24" />}>
        <PostFilters posts={posts} />
      </Suspense>
    </div>
  );
}
