import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: ["remark-frontmatter"],
  },
});

/** @type {import('next').NextConfig}*/
const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "mdx"],
  output: "export",
};

export default withMDX(nextConfig);
