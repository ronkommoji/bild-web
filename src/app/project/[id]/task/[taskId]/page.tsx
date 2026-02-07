import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Task, TaskProof } from "@/types/database";

async function getTask(projectId: string, taskId: string): Promise<Task | null> {
  const { data } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("project_id", projectId)
    .single();
  return data;
}

async function getProofs(taskId: string): Promise<TaskProof[]> {
  const { data } = await supabase
    .from("task_proofs")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed",
};
const priorityLabels: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string; taskId: string }>;
}) {
  const { id: projectId, taskId } = await params;
  const task = await getTask(projectId, taskId);
  if (!task) notFound();

  const proofs = await getProofs(taskId);

  return (
    <div className="min-h-screen">
      <header className="border-b border-[#E8DCC8] bg-[#FFFDF1] px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/project/${projectId}`}
              className="text-[#562F00] hover:text-[#FF9644]"
            >
              ← Project
            </Link>
            <h1 className="text-lg font-bold text-[#562F00]">Task details</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              task.priority === "high"
                ? "bg-red-100 text-red-800"
                : task.priority === "low"
                  ? "bg-green-100 text-green-800"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {priorityLabels[task.priority ?? "medium"]} priority
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              task.status === "completed"
                ? "bg-green-100 text-green-800"
                : task.status === "blocked"
                  ? "bg-red-100 text-red-800"
                  : task.status === "in_progress"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
            }`}
          >
            {statusLabels[task.status ?? "pending"]}
          </span>
        </div>

        <h2 className="text-2xl font-bold text-[#562F00]">{task.title}</h2>
        {task.location && (
          <p className="mt-2 flex items-center gap-1 text-[#8B6914]">📍 {task.location}</p>
        )}
        {task.description && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-[#A08050]">
              Description
            </h3>
            <p className="mt-1 text-[#562F00]">{task.description}</p>
          </div>
        )}
        {task.due_date && (
          <p className="mt-2 text-sm text-[#A08050]">
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        {task.blocked_reason && (
          <div className="mt-4 rounded-lg bg-red-50 p-4">
            <h3 className="text-sm font-semibold text-red-800">Blocked reason</h3>
            <p className="mt-1 text-red-700">{task.blocked_reason}</p>
          </div>
        )}

        <section id="proof" className="mt-10 scroll-mt-8">
          <h3 className="text-lg font-bold text-[#562F00]">
            Proof of work ({proofs.length} {proofs.length === 1 ? "submission" : "submissions"})
          </h3>
          {proofs.length === 0 ? (
            <p className="mt-2 text-[#A08050]">No proof submitted yet.</p>
          ) : (
            <div className="mt-4 space-y-6">
              {proofs.map((proof) => (
                <div
                  key={proof.id}
                  className="rounded-xl border border-[#E8DCC8] bg-white p-4 shadow-sm"
                >
                  <div className="flex flex-wrap gap-4">
                    {proof.photo_url && (
                      <div className="relative h-48 w-64 overflow-hidden rounded-lg bg-[#E8DCC8]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proof.photo_url}
                          alt="Proof photo"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    {proof.annotation_url && (
                      <div className="relative h-48 w-64 overflow-hidden rounded-lg bg-[#E8DCC8]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={proof.annotation_url}
                          alt="Annotation"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {proof.transcript && (
                    <div className="mt-3 flex gap-2 text-[#562F00]">
                      <span className="text-[#A08050]">🎤</span>
                      <p className="flex-1 italic">{proof.transcript}</p>
                    </div>
                  )}
                  <p className="mt-2 text-xs text-[#A08050]">
                    {proof.created_at
                      ? new Date(proof.created_at).toLocaleString()
                      : ""}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
