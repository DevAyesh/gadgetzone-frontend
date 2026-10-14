import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCollections } from "@/lib/api";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteCollection } from "./actions";

export const dynamic = 'force-dynamic';

export default async function AdminCollectionsPage() {
  let collections: any[] = [];
  try {
    collections = await getCollections({ cache: "no-store" });
  } catch (err) {
    console.warn("Error fetching collections:", err);
    collections = [];
  }

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
              collections.map((col) => {
                const id = col.id || col._id;
                return (
                  <TableRow key={id}>
                    <TableCell className="font-medium">{col.name}</TableCell>
                    <TableCell>{col.slug}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/collections/${id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="h-4 w-4" />
                      </Link>
                      <AdminDeleteButton
                        id={id}
                        name={col.name}
                        action={deleteCollection}
                        title="Delete collection"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
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
