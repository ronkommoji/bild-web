"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function HeaderWithProjectSelector() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");
  const [projects, setProjects] = useState<Pick<Project, "id" | "name">[]>([]);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, name")
      .order("name")
      .then(({ data }) => setProjects((data as Pick<Project, "id" | "name">[]) ?? []));
  }, []);

  function setProjectInUrl(id: string) {
    const next = new URLSearchParams(searchParams.toString());
    next.set("project", id);
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border px-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Supervisor Dashboard</span>
      </div>
      <div className="flex items-center gap-2">
        <Select
          value={projectId ?? ""}
          onValueChange={(id) => id && setProjectInUrl(id)}
        >
          <SelectTrigger className="w-[220px]" size="sm">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </header>
  );
}
