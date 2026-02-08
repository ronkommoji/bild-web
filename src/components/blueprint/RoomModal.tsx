"use client";

import { useState, useEffect } from "react";
import type { Room } from "@/types/blueprint";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  room: Room | null;
  open: boolean;
  onClose: () => void;
  onSave: (room: { id: string; name: string; points: Room["points"] }) => void;
  position: { x: number; y: number };
};

export function RoomModal({ room, open, onClose, onSave, position }: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (room) setName(room.name);
    else setName("");
  }, [room, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !room) return;
    onSave({ id: room.id, name: name.trim(), points: room.points });
    // Parent closes modal on successful save
  };

  const modalWidth = 320;
  const modalHeight = 140;
  const x = Math.min(
    Math.max(20, position.x - modalWidth / 2),
    typeof window !== "undefined" ? window.innerWidth - modalWidth - 20 : position.x
  );
  const y = Math.min(
    Math.max(20, position.y - 60),
    typeof window !== "undefined" ? window.innerHeight - modalHeight - 20 : position.y
  );

  return (
    <div
      className="fixed z-50 rounded-lg border border-[#E8DCC8] bg-white shadow-xl"
      style={{
        left: x,
        top: y,
        width: modalWidth,
      }}
    >
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="room-name">Room name</Label>
          <Input
            id="room-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Room 101"
            autoFocus
          />
        </div>
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={!name.trim()}>
            Save room
          </Button>
        </div>
      </form>
    </div>
  );
}
