import fs from "fs";
import path from "path";
import matter from "gray-matter";

const ABOUT_FILE = path.join(process.cwd(), "content", "about.mdx");

export interface AboutMeta {
  name: string;
  role?: string;
  content: string;
}

export function getAboutData(): AboutMeta {
  if (!fs.existsSync(ABOUT_FILE)) {
    return {
      name: "Shounak Dey",
      role: "Software Engineer",
      content:
        "I'm a software engineer interested in systems design, compilers, web technologies, and software architecture.",
    };
  }

  const fileContent = fs.readFileSync(ABOUT_FILE, "utf8");
  const { data, content } = matter(fileContent);

  return {
    name: (data.name as string) || "Shounak Dey",
    role: (data.role as string) || "",
    content: content.trim(),
  };
}
