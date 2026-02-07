"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectFile } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Upload, FileText, Trash2, Loader2 } from "lucide-react";

const BUCKET = "project-files";

export function FilesView({ projects }: { projects: Pick<Project, "id" | "name">[] }) {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>("");
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) {
      setFiles([]);
      return;
    }
    setLoading(true);
    supabase
      .from("project_files")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        setLoading(false);
        if (err) {
          setError(err.message);
          return;
        }
        setFiles((data as ProjectFile[]) ?? []);
        setError(null);
      });
  }, [projectId]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(true);
    setError(null);
    const ext = file.name.split(".").pop() ?? "";
    const path = `${projectId}/${crypto.randomUUID()}-${file.name}`;
    const { error: uploadErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });
    if (uploadErr) {
      setError(uploadErr.message);
      setUploading(false);
      return;
    }
    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path);
    const { error: insertErr } = await supabase.from("project_files").insert({
      project_id: projectId,
      name: file.name,
      file_path: path,
      file_size: file.size,
      content_type: file.type || null,
    });
    if (insertErr) {
      setError(insertErr.message);
      setUploading(false);
      return;
    }
    router.refresh();
    setFiles((prev) => [
      {
        id: "",
        project_id: projectId,
        name: file.name,
        file_path: path,
        file_size: file.size,
        content_type: file.type || null,
        uploaded_by: null,
        created_at: new Date().toISOString(),
      },
      ...prev,
    ]);
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(file: ProjectFile) {
    if (!confirm(`Delete "${file.name}"?`)) return;
    await supabase.storage.from(BUCKET).remove([file.file_path]);
    await supabase.from("project_files").delete().eq("id", file.id);
    router.refresh();
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
  }

  async function getDownloadUrl(file: ProjectFile): Promise<string> {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(file.file_path, 60);
    return data?.signedUrl ?? "#";
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
        No projects yet. Create a project first to upload files.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select project</CardTitle>
          <Select
            value={projectId}
            onValueChange={setProjectId}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Choose a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
      </Card>

      {projectId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Files</CardTitle>
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <Button type="button" disabled={uploading} className="flex items-center gap-2">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload file
                </Button>
            </label>
          </CardHeader>
          <CardContent>
            {error && (
              <p className="mb-4 text-sm text-destructive">{error}</p>
            )}
            {loading ? (
              <p className="py-8 text-center text-muted-foreground">Loading…</p>
            ) : files.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                No files yet. Upload a document.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {files.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <a
                          href="#"
                          className="flex items-center gap-2 text-primary hover:underline"
                          onClick={async (e) => {
                            e.preventDefault();
                            const url = await getDownloadUrl(file);
                            window.open(url, "_blank");
                          }}
                        >
                          <FileText className="h-4 w-4" />
                          {file.name}
                        </a>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.file_size != null
                          ? `${(file.file_size / 1024).toFixed(1)} KB`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {file.created_at
                          ? new Date(file.created_at).toLocaleString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
