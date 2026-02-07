import { supabase } from "@/lib/supabase";
import { KpiCards } from "./kpi-cards";
import { KpiCharts } from "./kpi-charts";

async function getStats() {
  const [
    { count: projectCount },
    { data: tasks },
    { data: activity },
  ] = await Promise.all([
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("tasks").select("id, status, completed_at, created_at"),
    supabase
      .from("activity_feed")
      .select("action, created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const taskList = tasks ?? [];
  const completed = taskList.filter((t) => t.status === "completed");
  const blocked = taskList.filter((t) => t.status === "blocked");
  const completionRate =
    taskList.length > 0 ? Math.round((completed.length / taskList.length) * 100) : 0;
  const completedThisWeek =
    activity?.filter((a) => a.action === "task_completed").length ?? 0;

  return {
    projectCount: projectCount ?? 0,
    totalTasks: taskList.length,
    completedTasks: completed.length,
    blockedCount: blocked.length,
    completionRate,
    completedThisWeek,
    tasksByStatus: {
      pending: taskList.filter((t) => t.status === "pending").length,
      in_progress: taskList.filter((t) => t.status === "in_progress").length,
      blocked: blocked.length,
      completed: completed.length,
    },
    activity: activity ?? [],
    tasks: taskList,
  };
}

export default async function HomePage() {
  const stats = await getStats();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Home</h1>
        <p className="text-muted-foreground">
          Key metrics and project health at a glance.
        </p>
      </div>

      <KpiCards stats={stats} />
      <KpiCharts stats={stats} />
    </div>
  );
}
