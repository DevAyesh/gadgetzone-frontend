import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminCollectionsPage() {
  const supabase = await createClient();
  const { data: collections } = await supabase.from("collections").select("*").order("name");

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Collections Management</h1>
        <Link href="/admin/collections/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Add Collection
        </Link>
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections && collections.length > 0 ? (
              collections.map((col) => (
                <TableRow key={col.id}>
                  <TableCell className="font-medium">{col.name}</TableCell>
                  <TableCell>{col.slug}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/collections/${col.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                      <Edit className="h-4 w-4" />
                    </Link>
                    <form action={async () => {
                      "use server";
                      const { deleteCollection } = await import("./actions");
                      const formData = new FormData();
                      formData.append("id", col.id);
                      await deleteCollection(formData);
                    }} className="inline-block">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" type="submit">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  No collections found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
