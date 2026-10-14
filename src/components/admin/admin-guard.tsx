"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingBag,
  Tags,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ShieldAlert,
  Lock,
  ArrowLeft,
  ExternalLink,
  Menu,
  X,
} from "lucide-react";
import { toast } from "sonner";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: ShoppingBag, exact: false },
  { href: "/admin/categories", label: "Categories", icon: Tags, exact: false },
  { href: "/admin/collections", label: "Collections", icon: LayoutDashboard, exact: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart, exact: false },
  { href: "/admin/customers", label: "Customers", icon: Users, exact: false },
  { href: "/admin/settings", label: "Settings", icon: Settings, exact: false },
];

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, token, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [safetyReady, setSafetyReady] = useState(
    () => useAuthStore.persist?.hasHydrated?.() ?? false
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const isStoreHydrated = useSyncExternalStore(
    (callback) => {
      const unsub = useAuthStore.persist?.onFinishHydration?.(callback);
      return () => {
        unsub?.();
      };
    },
    () => useAuthStore.persist?.hasHydrated?.() ?? false,
    () => false
  );

  // Safety fallback: in private browsing or unusual hydration timings,
  // ensure the guard never hangs indefinitely on the verification spinner.
  useEffect(() => {
    if (safetyReady) return;
    const timer = setTimeout(() => {
      setSafetyReady(true);
    }, 350);
    return () => clearTimeout(timer);
  }, [safetyReady]);

  const isHydrated = isStoreHydrated || safetyReady;

  // Auto-redirect unauthenticated users to login with ?next=/admin
  useEffect(() => {
    if (!mounted || !isHydrated) return;
    if (!isAuthenticated || !token || !user) {
      const target = pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login?next=/admin";
      router.replace(target);
    }
  }, [mounted, isHydrated, isAuthenticated, token, user, pathname, router]);

  // Synchronize auth token to browser cookies so Server Actions (e.g. categories, collections)
  // have direct access to credentials via cookies()
  useEffect(() => {
    if (typeof window !== "undefined" && token) {
      if (!document.cookie.includes(`token=${token}`)) {
        document.cookie = `token=${token}; path=/; max-age=604800; SameSite=Lax`;
      }
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out from Admin Portal.");
    const target = pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login?next=/admin";
    router.replace(target);
  };

  const handleSwitchAccount = () => {
    logout();
    toast.info("Logged out of non-admin account. Please sign in with administrator credentials.");
    const target = pathname ? `/login?next=${encodeURIComponent(pathname)}` : "/login?next=/admin";
    router.replace(target);
  };

  // State 1: Hydrating auth state
  if (!mounted || !isHydrated) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4" suppressHydrationWarning>
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center" suppressHydrationWarning>
          <div className="relative flex items-center justify-center" suppressHydrationWarning>
            <div className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <ShieldAlert className="w-6 h-6 text-primary absolute" />
          </div>
          <div className="space-y-1" suppressHydrationWarning>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Verifying Administrator Access</h2>
            <p className="text-sm text-muted-foreground">
              Checking permissions and validating secure admin session...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Unauthenticated user
  if (!isAuthenticated || !token || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4" suppressHydrationWarning>
        <div className="w-full max-w-md p-8 glass-card border border-border/50 rounded-2xl shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-150" suppressHydrationWarning>
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <Lock className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
              Admin Portal
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Sign In Required</h1>
            <p className="text-sm text-muted-foreground">
              You must sign in with an authorized administrator account to access the GadgetZone admin panel.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href={`/login?next=${encodeURIComponent(pathname || "/admin")}`}
              className={cn(buttonVariants({ variant: "default" }), "w-full h-11 text-base font-semibold")}
            >
              Sign In as Administrator
            </Link>

            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 text-sm font-medium")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home Page
            </Link>
          </div>

          <div className="pt-2 border-t border-border/50 text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span>Forgot admin credentials?</span>
            <Link
              href={`/forgot-password?next=${encodeURIComponent(pathname || "/admin")}`}
              className="text-primary hover:underline font-semibold"
            >
              Reset Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = Boolean(
    (user.isAdmin === true || user.role?.toLowerCase() === "admin" || user.isSuperAdmin === true) &&
    user.isActive !== false &&
    !user.isRemoved
  );

  // State 3: Authenticated user but NOT an administrator
  if (!isAdmin) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background p-4" suppressHydrationWarning>
        <div className="w-full max-w-lg p-8 glass-card border border-destructive/20 rounded-2xl shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150" suppressHydrationWarning>
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center border border-destructive/20 shadow-inner">
              <ShieldAlert className="h-9 w-9" />
            </div>
            <span className="inline-flex items-center px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive bg-destructive/10 rounded-full border border-destructive/20">
              403 Forbidden
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Access Denied: Admin Privileges Required
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              The GadgetZone admin portal is strictly restricted to authorized administrative personnel. Standard customer accounts do not have permission to view or manage store administration.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/50 border border-border/50 text-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <span>Signed In Account</span>
              <span className="px-2 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground font-semibold">
                {user.role ? user.role.toUpperCase() : "CUSTOMER"}
              </span>
            </div>
            <div className="font-semibold text-foreground text-base">{user.name}</div>
            <div className="text-xs text-muted-foreground font-mono">{user.email}</div>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "outline" }), "w-full h-11 text-sm font-semibold")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home Page
            </Link>

            <Button onClick={handleSwitchAccount} className="w-full h-11 text-sm font-semibold">
              <LogOut className="mr-2 h-4 w-4" />
              Switch Account / Login as Admin
            </Button>
          </div>

          <div className="pt-2 border-t border-border/50 text-center text-xs text-muted-foreground">
            <span>Already registered as an administrator? </span>
            <Link
              href={`/forgot-password?next=${encodeURIComponent(pathname || "/admin")}`}
              className="text-primary hover:underline font-semibold"
            >
              Reset Admin Password
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // State 4: Authenticated Administrator - Render full Admin Shell
  const isLinkActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  const adminInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "AD";

  return (
    <div className="flex min-h-screen bg-background" suppressHydrationWarning>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border/50 glass hidden md:flex flex-col shrink-0">
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <Link
            href="/admin"
            className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary"
          >
            GadgetZone Admin
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isLinkActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary/15 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50 space-y-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-muted/40 border border-border/40">
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0">
              {adminInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 w-full rounded-lg hover:bg-destructive/10 text-destructive text-xs font-semibold transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <div className="text-[11px] text-muted-foreground px-2">GadgetZone v2.0 - 2026</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border/50 glass sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted md:hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm md:text-base">Admin Portal</span>
              <span
                className={`hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  user.isSuperAdmin
                    ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {user.isSuperAdmin ? "Super Admin" : "Administrator"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden sm:inline-flex text-xs gap-1.5 text-muted-foreground hover:text-foreground")}
            >
              <span>View Store</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-2 border-l border-border/50">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-xs text-primary">
                {adminInitials}
              </div>
              <span className="text-xs font-medium text-foreground hidden lg:inline max-w-[120px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors hidden sm:block"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Mobile Sidebar Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border/50 bg-background/95 backdrop-blur-md px-4 py-3 space-y-1 animate-in slide-in-from-top-2 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/15 text-primary font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <div className="pt-2 border-t border-border/50 flex items-center justify-between">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <span>View Store</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="text-xs text-destructive hover:underline font-semibold flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
