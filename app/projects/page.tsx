import Link from "next/link";
import { getAllProjects } from "@/lib/projects";

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <div className="max-w-[72ch] mx-auto px-6 py-12 font-departure space-y-8">
      <header className="space-y-2 pb-6 border-b border-rule">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--ink)]">
          All Projects
        </h1>
        <p className="text-xs text-ink-mute">
          Software tools, compilers, and experiments.
        </p>
      </header>

      {projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project, idx) => (
            <div
              key={project.slug}
              className="p-5 rounded-lg border border-rule bg-card hover:border-[var(--accent)] transition-colors space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <Link
                  href={`/projects/${project.slug}`}
                  className="font-semibold text-lg text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors"
                >
                  {project.title}
                </Link>
                <span className="text-xs text-ink-mute">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm text-[var(--ink-body)] font-serif">
                {project.description}
              </p>
              <div className="flex gap-2 pt-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] px-2 py-0.5 rounded bg-[var(--bg)] border border-rule text-ink-mute"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-mute italic">No projects found.</p>
      )}
    </div>
  );
}
