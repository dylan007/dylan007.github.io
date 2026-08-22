import fs from "fs";
import path from "path";
import matter from "gray-matter";

const POSTS_DIR = path.join(process.cwd(), "content");

export interface PostMeta {
  title: string;
  date: string;
  slug: string;
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
        !fs.statSync(path.join(POSTS_DIR, f)).isDirectory() &&
        f !== "about.mdx"
    );

  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, "");
    const fileContent = fs.readFileSync(path.join(POSTS_DIR, filename), "utf8");
    const { data } = matter(fileContent);

    return {
      title: data.title as string,
      date: data.date as string,
      slug,
    };
  });

  return posts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostWithNeighbors(
  slug: string,
): PostWithNeighbors | undefined {
  const posts = getAllPosts(); // newest first
  const index = posts.findIndex((p) => p.slug === slug);

  if (index === -1) return undefined;

  return {
    meta: posts[index],
    // "prev" = older post, "next" = newer post — adjust naming to taste
    prev: posts[index + 1] ?? null,
    next: posts[index - 1] ?? null,
  };
}
