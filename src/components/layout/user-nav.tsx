"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, LogOut, Package, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/lib/store/auth-store";

export function UserNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Link href="/login" className="p-2 text-foreground hover:bg-muted rounded-full">
        <User className="h-5 w-5" />
        <span className="sr-only">Account</span>
      </Link>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Link href="/login" className="p-2 text-foreground hover:bg-muted rounded-full flex items-center gap-1.5 text-sm font-medium">
        <User className="h-5 w-5" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    router.push("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-muted transition-colors border border-border/40"
        title={user.name}
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
          {user.name ? user.name.slice(0, 2) : "ME"}
        </div>
        <span className="text-xs font-semibold max-w-[100px] truncate hidden md:inline">
          {user.name.split(" ")[0]}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-background/95 backdrop-blur-md rounded-xl border border-border shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b border-border/50">
              <p className="text-sm font-medium leading-none text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
            </div>

            <div className="py-1">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                <span>My Profile</span>
              </Link>

              <Link
                href="/account?tab=orders"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
              >
                <Package className="h-4 w-4 text-muted-foreground" />
                <span>My Orders</span>
              </Link>

              {Boolean(user.isAdmin || user.role?.toLowerCase() === "admin") && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:bg-muted transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </div>

            <div className="border-t border-border/50 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
