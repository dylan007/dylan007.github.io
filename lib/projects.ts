import fs from "fs";
import path from "path";
import matter from "gray-matter";

const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

export interface ProjectMeta {
  title: string;
  description: string;
  tags: string[];
  link?: string;
  order?: number;
  slug: string;
}

export interface ProjectWithNeighbors {
  meta: ProjectMeta;
  prev: ProjectMeta | null;
  next: ProjectMeta | null;
}

export function getAllProjects(): ProjectMeta[] {
  if (!fs.existsSync(PROJECTS_DIR)) {
    return [];
  }

  const files = fs
    .readdirSync(PROJECTS_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));

  const projects = files.map((filename) => {
    const slug = filename.replace(/\.(mdx|md)$/, "");
    const fileContent = fs.readFileSync(
      path.join(PROJECTS_DIR, filename),
      "utf8"
    );
    const { data } = matter(fileContent);

    return {
      title: (data.title as string) || slug,
      description: (data.description as string) || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      link: (data.link as string) || "#",
      order: typeof data.order === "number" ? data.order : 99,
      slug,
    };
  });

  return projects.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export function getProjectWithNeighbors(
  slug: string
): ProjectWithNeighbors | undefined {
  const projects = getAllProjects();
  const index = projects.findIndex((p) => p.slug === slug);

  if (index === -1) return undefined;

  return {
    meta: projects[index],
    prev: projects[index - 1] ?? null,
    next: projects[index + 1] ?? null,
  };
}
