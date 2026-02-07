import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data ?? [];
}

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            All projects with health indicators. Select a project to view tasks and proof.
          </p>
        </div>
        <Button asChild>
          <Link href="/project/new">+ New project</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No projects yet.</p>
              <Button asChild className="mt-4">
                <Link href="/project/new">Create one to get started</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map((project) => (
            <Link key={project.id} href={`/project/${project.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground">{project.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        project.status === "active"
                          ? "bg-green-100 text-green-800"
                          : project.status === "completed"
                            ? "bg-muted text-muted-foreground"
                            : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {project.status ?? "active"}
                    </span>
                  </div>
                  {project.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                  {project.address && (
                    <p className="mt-1 text-xs text-muted-foreground">{project.address}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
