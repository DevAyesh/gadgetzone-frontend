import type { Metadata } from "next";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutDashboard, ShoppingBag, Users, Settings, Tags, ShoppingCart, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "GadgetZone Admin",
  description: "Admin panel for GadgetZone",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) {
    redirect("/?error=Unauthorized Access");
  }

  return (
    <div className="flex min-h-screen bg-background">
      
      {/* Admin Sidebar */}
      <aside className="w-64 border-r border-border/50 glass hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <Link href="/admin" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            GadgetZone Admin
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Dashboard
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <ShoppingBag className="h-5 w-5 text-primary" />
            Products
          </Link>
          <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <Tags className="h-5 w-5 text-primary" />
            Categories
          </Link>
          <Link href="/admin/collections" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Collections
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Orders
          </Link>
          <Link href="/admin/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <Users className="h-5 w-5 text-primary" />
            Customers
          </Link>
          <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-sm font-medium transition-colors">
            <Settings className="h-5 w-5 text-primary" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-border/50 space-y-4">
          <form action={async () => {
            "use server";
            const { logout } = await import("@/app/(store)/(auth)/actions");
            await logout();
          }}>
            <button type="submit" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-destructive/10 text-destructive text-sm font-medium transition-colors">
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </form>
          <div className="text-xs text-muted-foreground px-3">GadgetZone v2.0 - 2026</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 glass sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="font-semibold text-muted-foreground">
            Admin Portal
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary">
              A
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}
