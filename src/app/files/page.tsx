import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";
import { FilesView } from "../files-view";

async function getProjects(): Promise<Pick<Project, "id" | "name">[]> {
  const { data } = await supabase
    .from("projects")
    .select("id, name")
    .order("name");
  return (data ?? []) as Pick<Project, "id" | "name">[];
}

export default async function FilesPage() {
  const projects = await getProjects();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Files</h1>
        <p className="text-muted-foreground">
          Upload and manage project documentation. Select a project to view or upload files.
        </p>
      </div>
      <FilesView projects={projects} />
    </div>
  );
}
