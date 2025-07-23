"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

interface CreateHabitModalProps {
  userId: Id<"users">;
  hasPartner: boolean;
  children: React.ReactNode;
}

export function CreateHabitModal({ userId, hasPartner, children }: CreateHabitModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isShared, setIsShared] = useState(false);
  const [loading, setLoading] = useState(false);

  const createHabit = useMutation(api.habits.createHabit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please enter a habit title");
      return;
    }

    setLoading(true);

    try {
      await createHabit({
        ownerId: userId,
        title: title.trim(),
        isShared: hasPartner ? isShared : false,
      });

      toast.success("Habit created successfully! 🌱");
      setTitle("");
      setIsShared(false);
      setOpen(false);
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Failed to create habit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-green-600">🌱</span>
            Create New Habit
          </DialogTitle>
          <DialogDescription>
            Start building a new habit today. Consistency is key!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Habit Title</Label>
            <Input
              id="title"
              placeholder="e.g., Drink 8 glasses of water"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              disabled={loading}
            />
          </div>
          
          {hasPartner && (
            <div className="flex items-center space-x-2">
              <Switch
                id="shared"
                checked={isShared}
                onCheckedChange={setIsShared}
                disabled={loading}
              />
              <Label htmlFor="shared" className="text-sm">
                Share with partner (both can track this habit)
              </Label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              disabled={loading || !title.trim()}
            >
              {loading ? "Creating..." : "Create Habit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
