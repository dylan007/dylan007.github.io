import { getAllPosts, getPostWithNeighbors } from "@/lib/posts";
import PostLayout from "@/components/PostLayout";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostWithNeighbors(slug);

  if (!post) notFound();

  const { default: Post } = await import(`@/content/posts/${slug}.mdx`);

  return (
    <PostLayout meta={post.meta} prev={post.prev} next={post.next}>
      <Post />
    </PostLayout>
  );
}

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export const dynamicParams = false;
