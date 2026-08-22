import { getAllProjects, getProjectWithNeighbors } from "@/lib/projects";
import ProjectLayout from "@/components/ProjectLayout";
import { notFound } from "next/navigation";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectWithNeighbors(slug);

  if (!project) notFound();

  const { default: Project } = await import(`@/content/projects/${slug}.mdx`);

  return (
    <ProjectLayout meta={project.meta} prev={project.prev} next={project.next}>
      <Project />
    </ProjectLayout>
  );
}

export async function generateStaticParams() {
  return getAllProjects().map((project) => ({ slug: project.slug }));
}

export const dynamicParams = false;
