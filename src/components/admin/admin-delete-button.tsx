"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AdminDeleteButtonProps {
  id: string;
  name: string;
  action: (formData: FormData) => Promise<void>;
  title?: string;
  confirmMessage?: string;
}

export function AdminDeleteButton({
  id,
  name,
  action,
  title = "Delete",
  confirmMessage,
}: AdminDeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const prompt =
      confirmMessage || `Are you sure you want to delete "${name}"? This action cannot be undone.`;
    if (!confirm(prompt)) {
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", id);
        await action(formData);
        toast.success(`"${name}" was deleted successfully.`);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to delete item";
        toast.error(message);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-destructive hover:bg-destructive/10"
      onClick={handleDelete}
      disabled={isPending}
      title={title}
      type="button"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  );
}
