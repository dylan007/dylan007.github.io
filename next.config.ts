import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const prettyCodeOptions = {
  theme: "solarized-light",
  keepBackground: true,
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm", "remark-math"],
    rehypePlugins: ["rehype-katex", ["rehype-pretty-code", prettyCodeOptions]],
  },
});

/** @type {import('next').NextConfig}*/
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "export",
};

export default withMDX(nextConfig);
