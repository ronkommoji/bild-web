"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Task } from "@/types/database";
import type { Pin } from "@/types/blueprint";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2 } from "lucide-react";

type Props = {
  projectId: string;
  pin: Pin | null;
  tasks: Task[];
  open: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onLinkTask: (pinId: string, taskId: string) => void;
  onDeletePin?: (pinId: string) => void;
  onOpenTask?: (taskId: string) => void;
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed",
};

export function TaskModal({
  projectId,
  pin,
  tasks,
  open,
  position,
  onClose,
  onLinkTask,
  onDeletePin,
  onOpenTask,
}: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  useEffect(() => {
    if (pin) setSelectedTaskId(pin.taskId);
    else setSelectedTaskId("");
  }, [pin, open]);

  if (!open || !pin) return null;

  const linkedTask = tasks.find((t) => t.id === pin.taskId);
  const modalWidth = 320;
  const x = Math.min(
    Math.max(20, position.x - modalWidth / 2),
    typeof window !== "undefined" ? window.innerWidth - modalWidth - 20 : position.x
  );
  const y = Math.min(
    Math.max(20, position.y - 80),
    typeof window !== "undefined" ? window.innerHeight - 200 : position.y
  );

  return (
    <div
      className="fixed z-50 rounded-lg border border-[#E8DCC8] bg-white shadow-xl p-4 space-y-3"
      style={{ left: x, top: y, width: modalWidth }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[#562F00]">Task at pin</span>
        <Button type="button" variant="ghost" size="icon-xs" onClick={onClose}>
          ×
        </Button>
      </div>
      {linkedTask && (
        <div className="text-sm text-[#8B6914]">
          Current:{" "}
          <Link
            href={`/project/${projectId}/task/${linkedTask.id}`}
            className="text-[#FF9644] hover:underline"
          >
            {linkedTask.title}
          </Link>{" "}
          ({statusLabels[linkedTask.status ?? "pending"]})
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[#A08050]">Assign task</label>
        <Select
          value={selectedTaskId}
          onValueChange={(v) => {
            setSelectedTaskId(v);
            onLinkTask(pin.id, v);
            onClose();
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose task…" />
          </SelectTrigger>
          <SelectContent>
            {tasks.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.title} — {statusLabels[t.status ?? "pending"]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="button" size="sm" variant="outline" asChild>
          <Link href={`/project/${projectId}/task/new`}>New task</Link>
        </Button>
        {linkedTask && (
          <Button type="button" size="sm" asChild>
            <Link href={`/project/${projectId}/task/${linkedTask.id}`} onClick={onClose}>
              <Pencil className="size-3.5 mr-1" />
              Edit task
            </Link>
          </Button>
        )}
        {onDeletePin && pin && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={async () => {
              await onDeletePin(pin.id);
              onClose();
            }}
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete pin
          </Button>
        )}
      </div>
    </div>
  );
}
