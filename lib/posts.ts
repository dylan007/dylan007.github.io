import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  title: string;
  date: string;
  slug: string;
  tags: string[];
  status?: "unpublished" | "published";
}

export interface PostWithNeighbors {
  meta: PostMeta;
  prev: PostMeta | null;
  next: PostMeta | null;
}

export function getAllPosts(): PostMeta[] {
  const files = fs
    .readdirSync(POSTS_DIR)
    .filter(
      (f) =>
        f.endsWith(".mdx") &&
        !fs.statSync(path.join(POSTS_DIR, f)).isDirectory()
    );

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const fileContent = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data } = matter(fileContent);

    return {
      title: data.title as string,
      date: data.date as string,
      slug,
      tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      status: data.status as PostMeta["status"],
    };
  });

  return posts.sort(
    (a, b) => Date.parse(b.date) - Date.parse(a.date),
  );
}

export function getPostWithNeighbors(
  slug: string,
): PostWithNeighbors | undefined {
  const posts = getAllPosts(); // newest publication date first
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) return undefined;

  return {
    meta: posts[index],
    // The previous publication belongs on the left; the next one belongs on the right.
    prev: posts[index - 1] ?? null,
    next: posts[index + 1] ?? null,
  };
}
