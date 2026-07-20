// @ts-nocheck
const createClient = async () => ({ from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null }), order: () => ({ data: [] }), returns: () => ({ data: [] }) }), order: () => ({ data: [] }), single: () => ({ data: null }), ilike: () => ({ data: [] }), limit: () => ({ data: [] }) }), insert: () => ({ select: () => ({ single: () => ({ error: null, data: null }) }), error: null }), update: () => ({ eq: () => ({ error: null }) }), delete: () => ({ eq: () => ({ error: null }) }) }), auth: { getUser: async () => ({ data: { user: null } }), signOut: async () => {} } }) as any;
const createSupabaseClient = createClient;
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

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
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="text-2xl">{cat.icon}</TableCell>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>{cat.slug}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Link href={`/admin/categories/${cat.id}/edit`} className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}>
                      <Edit className="h-4 w-4" />
                    </Link>
                    <form action={async () => {
                      "use server";
                      const { deleteCategory } = await import("./actions");
                      const formData = new FormData();
                      formData.append("id", cat.id);
                      await deleteCategory(formData);
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
