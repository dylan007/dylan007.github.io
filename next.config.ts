import type { NextConfig } from "next";
import createMDX from "@next/mdx";
// import remarkGfm from "remark-gfm";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
  },
});

/** @type {import('next').NextConfig}*/
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  output: "export",
};

export default withMDX(nextConfig);
