import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buttonVariants } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getCategories } from "@/lib/api";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { deleteCategory } from "./actions";

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  let categories: any[] = [];
  try {
    categories = await getCategories({ cache: "no-store" });
  } catch (err) {
    console.warn("Error fetching categories:", err);
    categories = [];
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
        <Link href="/admin/categories/new" className={cn(buttonVariants(), "gap-2")}>
          <Plus className="h-4 w-4" /> Add Category
        </Link>
      </div>

      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Icon</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((cat) => {
                const id = cat.id || cat._id;
                return (
                  <TableRow key={id}>
                    <TableCell className="text-2xl">{cat.icon || "📦"}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Link href={`/admin/categories/${id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                        <Edit className="h-4 w-4" />
                      </Link>
                      <AdminDeleteButton
                        id={id}
                        name={cat.name}
                        action={deleteCategory}
                        title="Delete category"
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
