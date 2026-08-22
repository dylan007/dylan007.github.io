import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { getAllProjects } from "@/lib/projects";
import { getAboutData } from "@/lib/about";

export default function Home() {
  const about = getAboutData();
  const allPosts = getAllPosts();
  const allProjects = getAllProjects();

  const posts = allPosts.slice(0, 5);
  const projects = allProjects.slice(0, 2);

  return (
    <div className="max-w-[72ch] mx-auto px-6 py-12 space-y-16">
      {/* Bio / Intro Section */}
      <section className="space-y-4">
        <h1 className="text-3xl font-serif font-medium tracking-tight text-[var(--ink)]">
          {about.name}
        </h1>
        <p className="text-base text-[var(--ink-body)] leading-relaxed font-serif whitespace-pre-line">
          {about.content}
        </p>
      </section>

      {/* Blog Section (Latest 5) */}
      <section id="blog" className="space-y-6 pt-4 border-t border-rule font-departure">
        <div className="flex items-center justify-between text-sm text-ink-mute uppercase tracking-wider">
          <span>{"// Blog"}</span>
          <Link
            href="/posts"
            className="text-xs hover:text-[var(--accent)] transition-colors font-normal lowercase tracking-normal"
          >
            view all ({allPosts.length}) →
          </Link>
        </div>
        {posts.length > 0 ? (
          <div className="divide-y divide-rule">
            {posts.map((post, idx) => (
              <div key={post.slug} className="py-4 first:pt-0 last:pb-0 flex items-baseline justify-between gap-4 group">
                <Link
                  href={`/posts/${post.slug}`}
                  className="font-medium text-base text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors flex items-center gap-3"
                >
                  <span className="text-xs text-ink-mute w-6">0{idx + 1}.</span>
                  <span>{post.title}</span>
                </Link>
                <time className="text-xs text-ink-mute whitespace-nowrap">
                  {post.date}
                </time>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-ink-mute italic py-2">No posts yet.</p>
        )}
      </section>

      {/* Projects Section (Latest 2) */}
      <section id="projects" className="space-y-6 pt-4 border-t border-rule">
        <div className="flex items-center justify-between font-departure text-sm text-ink-mute uppercase tracking-wider">
          <span>{"// Projects"}</span>
          <Link
            href="/projects"
            className="text-xs hover:text-[var(--accent)] transition-colors font-normal lowercase tracking-normal"
          >
            view all ({allProjects.length}) →
          </Link>
        </div>
        {projects.length > 0 ? (
          <div className="grid gap-4">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className="p-5 rounded-lg border border-rule bg-card hover:border-[var(--accent)] transition-colors space-y-2 group"
              >
                <div className="flex items-center justify-between font-departure">
                  <Link
                    href={`/projects/${project.slug}`}
                    className="font-semibold text-lg text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors"
                  >
                    {project.title}
                  </Link>
                  <span className="text-xs text-ink-mute">0{idx + 1}</span>
                </div>
                <p className="text-sm text-[var(--ink-body)] font-serif">
                  {project.description}
                </p>
                <div className="flex gap-2 pt-2">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-departure px-2 py-0.5 rounded bg-[var(--bg)] border border-rule text-ink-mute"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm font-departure text-ink-mute italic py-2">No projects yet.</p>
        )}
      </section>
    </div>
  );
}
