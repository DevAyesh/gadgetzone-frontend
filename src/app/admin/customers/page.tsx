"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  getAllUsersAdmin,
  updateUserStatusAdmin,
  updateUserRoleAdmin,
  createAdminUser,
  ApiError,
} from "@/lib/api";
import { useAuthStore } from "@/lib/store/auth-store";
import type { UserProfile } from "@/lib/types/auth";
import {
  Loader2,
  Users,
  Search,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  UserCheck,
  UserX,
  UserPlus,
  Shield,
  Crown,
  User,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "admins" | "customers">("all");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Add Admin Dialog state
  const [addAdminOpen, setAddAdminOpen] = useState(false);
  const [creatingAdmin, setCreatingAdmin] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRoleType, setNewAdminRoleType] = useState<"admin" | "superadmin">("admin");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsersAdmin();
      setUsers(res.data || []);
    } catch (err: unknown) {
      console.warn("Failed to fetch admin users:", err);
      toast.error(err instanceof ApiError ? err.message : "Failed to fetch users list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    getAllUsersAdmin()
      .then((res) => {
        if (!ignore) {
          setUsers(res.data || []);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          console.warn("Failed to fetch admin users:", err);
          toast.error(err instanceof ApiError ? err.message : "Failed to fetch users list.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newAdminName.trim()) {
      toast.error("Please enter a name");
      return;
    }
    if (!newAdminEmail.trim() || !newAdminEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    if (!newAdminPassword || newAdminPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setCreatingAdmin(true);
    try {
      const isSuper = newAdminRoleType === "superadmin";
      const res = await createAdminUser({
        name: newAdminName.trim(),
        email: newAdminEmail.trim().toLowerCase(),
        password: newAdminPassword,
        isSuperAdmin: isSuper,
      });

      toast.success(
        res.message || `Administrator ${newAdminName} created successfully!`
      );

      // Append or update user list
      if (res.data) {
        setUsers((prev) => {
          const exists = prev.some((u) => u._id === res.data._id);
          if (exists) {
            return prev.map((u) => (u._id === res.data._id ? res.data : u));
          }
          return [res.data, ...prev];
        });
      } else {
        await fetchUsers();
      }

      // Reset form
      setNewAdminName("");
      setNewAdminEmail("");
      setNewAdminPassword("");
      setNewAdminRoleType("admin");
      setAddAdminOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Failed to create administrator");
    } finally {
      setCreatingAdmin(false);
    }
  };

  const handleToggleStatus = async (user: UserProfile) => {
    if (user._id === currentUser?._id || Boolean(user.userId && user.userId === currentUser?.userId)) {
      toast.error("You cannot deactivate your own account.");
      return;
    }

    if (user.isSuperAdmin && !currentUser?.isSuperAdmin) {
      toast.error("Only Super Admins can deactivate a Super Admin account.");
      return;
    }

    setActionLoadingId(user._id);
    const newStatus = !user.isActive;
    try {
      await updateUserStatusAdmin(user._id, newStatus);
      toast.success(`User ${user.name} is now ${newStatus ? "Active" : "Deactivated"}`);
      setUsers((prev) =>
        prev.map((u) => (u._id === user._id ? { ...u, isActive: newStatus } : u))
      );
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update user status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleRole = async (user: UserProfile) => {
    if (user._id === currentUser?._id || Boolean(user.userId && user.userId === currentUser?.userId)) {
      toast.error("You cannot demote your own account.");
      return;
    }

    if (user.isSuperAdmin && !currentUser?.isSuperAdmin) {
      toast.error("Only Super Admins can modify the role of another Super Admin.");
      return;
    }

    setActionLoadingId(user._id);
    const isCurrentlyAdmin = user.role === "admin" || user.isAdmin === true;
    const newRole = isCurrentlyAdmin ? "customer" : "admin";

    try {
      await updateUserRoleAdmin(user._id, newRole, false);
      toast.success(`User ${user.name} role changed to ${newRole}`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
                ...u,
                role: newRole,
                isAdmin: newRole === "admin",
                isSuperAdmin: newRole === "customer" ? false : u.isSuperAdmin,
              }
            : u
        )
      );
    } catch (err: unknown) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update user role.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleSuperAdmin = async (user: UserProfile) => {
    if (!currentUser?.isSuperAdmin) {
      toast.error("Only Super Admins can grant or revoke Super Admin privileges.");
      return;
    }

    if (user._id === currentUser?._id || Boolean(user.userId && user.userId === currentUser?.userId)) {
      toast.error("You cannot change your own Super Admin status.");
      return;
    }

    setActionLoadingId(user._id);
    const newSuperAdminState = !user.isSuperAdmin;

    try {
      await updateUserRoleAdmin(user._id, "admin", newSuperAdminState);
      toast.success(
        newSuperAdminState
          ? `Super Admin privileges granted to ${user.name}`
          : `Super Admin privileges revoked from ${user.name}`
      );
      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id
            ? {
                ...u,
                role: "admin",
                isAdmin: true,
                isSuperAdmin: newSuperAdminState,
              }
            : u
        )
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to update Super Admin status."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter users by search and tab
  const filteredUsers = users.filter((u) => {
    const isUserAdmin = u.role === "admin" || u.isAdmin === true;

    if (activeTab === "admins" && !isUserAdmin) return false;
    if (activeTab === "customers" && isUserAdmin) return false;

    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(term) ||
      (u.email || "").toLowerCase().includes(term) ||
      (u.phoneNumber || "").includes(term) ||
      (u.userId !== undefined && String(u.userId).includes(term))
    );
  });

  const totalAdmins = users.filter((u) => u.role === "admin" || u.isAdmin === true).length;
  const totalSuperAdmins = users.filter((u) => u.isSuperAdmin === true).length;
  const totalCustomers = users.filter((u) => u.role !== "admin" && !u.isAdmin).length;
  const totalActive = users.filter((u) => u.isActive !== false).length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">User & Admin Management</h1>
            {currentUser?.isSuperAdmin && (
              <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-semibold">
                <Crown className="h-3 w-3" /> Super Admin Access
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user directory, view administrators, onboard new admins, and configure role permissions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="gap-2 rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Add Admin Dialog */}
          <Dialog open={addAdminOpen} onOpenChange={setAddAdminOpen}>
            <DialogTrigger render={<Button className="gap-2 rounded-lg" />}>
              <UserPlus className="h-4 w-4" />
              <span>Add Administrator</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Onboard New Administrator</span>
                </DialogTitle>
                <DialogDescription>
                  Create a new administrator account with elevated permissions to manage the GadgetZone store.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateAdmin} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Full Name
                  </label>
                  <Input
                    required
                    placeholder="e.g. Kasun Perera"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Email Address
                  </label>
                  <Input
                    required
                    type="email"
                    placeholder="e.g. admin@gadgetzone.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Initial Password
                  </label>
                  <Input
                    required
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2 pt-2 border-t border-border/50">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Administrative Role Type
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewAdminRoleType("admin")}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        newAdminRoleType === "admin"
                          ? "border-primary bg-primary/10 text-foreground font-semibold ring-1 ring-primary"
                          : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                        <Shield className="h-3.5 w-3.5" />
                        Administrator
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Can manage products, orders, categories, and view customers.
                      </p>
                    </button>

                    <button
                      type="button"
                      disabled={!currentUser?.isSuperAdmin}
                      onClick={() => setNewAdminRoleType("superadmin")}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        newAdminRoleType === "superadmin"
                          ? "border-amber-500 bg-amber-500/10 text-foreground font-semibold ring-1 ring-amber-500"
                          : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                      } ${!currentUser?.isSuperAdmin ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mb-1">
                        <Crown className="h-3.5 w-3.5" />
                        Super Admin
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-tight">
                        Full root privileges including adding and modifying admins.
                      </p>
                    </button>
                  </div>
                  {!currentUser?.isSuperAdmin && (
                    <p className="text-[11px] text-muted-foreground italic">
                      * Only Super Admins can create new Super Admin accounts.
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <DialogClose render={<Button type="button" variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button type="submit" disabled={creatingAdmin} className="gap-2">
                    {creatingAdmin ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Create Admin Account
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border/50 bg-card glass-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Total Accounts</span>
            <Users className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold mt-2">{users.length}</div>
          <p className="text-xs text-muted-foreground mt-0.5">Registered user base</p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card glass-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Administrators</span>
            <Shield className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-purple-600 dark:text-purple-400">
            {totalAdmins}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalSuperAdmins} Super Admin{totalSuperAdmins === 1 ? "" : "s"}
          </p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card glass-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Customers</span>
            <User className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-blue-600 dark:text-blue-400">
            {totalCustomers}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Store shopper accounts</p>
        </div>

        <div className="p-4 rounded-xl border border-border/50 bg-card glass-card">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium uppercase tracking-wider">Active Users</span>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </div>
          <div className="text-2xl font-bold mt-2 text-green-600 dark:text-green-400">
            {totalActive}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Enabled store access</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-xl border border-border/50 bg-card glass-card overflow-hidden">
        {/* Toolbar: Filter Tabs & Search */}
        <div className="p-4 border-b border-border/50 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Accounts ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admins")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "admins"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Administrators ({totalAdmins})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("customers")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "customers"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Customers ({totalCustomers})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background/50 text-sm h-9"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium shrink-0">
              Showing: {filteredUsers.length}
            </span>
          </div>
        </div>

        {/* Users Table */}
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>User / Account</TableHead>
              <TableHead>Email & Verification</TableHead>
              <TableHead>Contact / Location</TableHead>
              <TableHead>Role & Access</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Admin Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span>Loading directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((u) => {
                const isOperating = actionLoadingId === u._id;
                const isSelf = u._id === currentUser?._id || Boolean(u.userId && u.userId === currentUser?.userId);
                const isUserAdmin = u.role === "admin" || u.isAdmin === true;
                const isUserSuperAdmin = u.isSuperAdmin === true;
                const canModifyTarget =
                  !isSelf &&
                  (!isUserSuperAdmin || currentUser?.isSuperAdmin === true);

                return (
                  <TableRow key={u._id} className={isSelf ? "bg-primary/5" : ""}>
                    {/* User Profile */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                            isUserSuperAdmin
                              ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/40"
                              : isUserAdmin
                              ? "bg-purple-500/20 text-purple-600 dark:text-purple-400"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {isUserSuperAdmin ? (
                            <Crown className="h-4 w-4" />
                          ) : (
                            u.name ? u.name.slice(0, 2) : "US"
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-semibold text-sm">{u.name}</p>
                            {isSelf && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary">
                                YOU
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            ID: #{u.userId || u._id.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Email & Verification */}
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium font-mono text-xs">{u.email}</span>
                        {u.isEmailVerified ? (
                          <span className="text-[11px] text-green-500 flex items-center gap-1 mt-0.5">
                            <ShieldCheck className="h-3 w-3" /> Verified
                          </span>
                        ) : (
                          <span className="text-[11px] text-yellow-500 flex items-center gap-1 mt-0.5">
                            <ShieldAlert className="h-3 w-3" /> Unverified
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Phone / Location */}
                    <TableCell className="text-xs text-muted-foreground">
                      {u.phoneNumber ? <div>{u.phoneNumber}</div> : <div className="italic text-muted-foreground/60">No phone</div>}
                      {u.address_line1 ? (
                        <div className="truncate max-w-[140px]">{u.address_line1}</div>
                      ) : (
                        <div className="italic text-muted-foreground/60">No address</div>
                      )}
                    </TableCell>

                    {/* Role & Access */}
                    <TableCell>
                      {isUserSuperAdmin ? (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold gap-1"
                        >
                          <Crown className="h-3 w-3" /> SUPER ADMIN
                        </Badge>
                      ) : isUserAdmin ? (
                        <Badge
                          variant="outline"
                          className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 font-semibold gap-1"
                        >
                          <Shield className="h-3 w-3" /> ADMIN
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 gap-1"
                        >
                          <User className="h-3 w-3" /> CUSTOMER
                        </Badge>
                      )}
                    </TableCell>

                    {/* Account Status */}
                    <TableCell>
                      {u.isActive ? (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 font-medium"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-destructive/10 text-destructive border-destructive/20 font-medium"
                        >
                          Deactivated
                        </Badge>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Super Admin Privileges Toggle (Super Admin only) */}
                        {currentUser?.isSuperAdmin && isUserAdmin && !isSelf && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isOperating}
                            onClick={() => handleToggleSuperAdmin(u)}
                            className={`text-xs h-8 gap-1 ${
                              isUserSuperAdmin
                                ? "border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                                : "text-muted-foreground hover:text-amber-600"
                            }`}
                            title={
                              isUserSuperAdmin
                                ? "Revoke Super Admin privileges"
                                : "Grant Super Admin privileges"
                            }
                          >
                            <Sparkles className="h-3 w-3" />
                            {isUserSuperAdmin ? "Demote Super" : "Make Super"}
                          </Button>
                        )}

                        {/* Regular Admin / Customer Role Toggle */}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isOperating || !canModifyTarget}
                          onClick={() => handleToggleRole(u)}
                          className="text-xs h-8"
                          title={
                            isSelf
                              ? "Cannot change your own role"
                              : !canModifyTarget
                              ? "Only Super Admins can modify Super Admin accounts"
                              : isUserAdmin
                              ? "Demote to customer"
                              : "Promote to admin"
                          }
                        >
                          {isUserAdmin ? "Make Customer" : "Make Admin"}
                        </Button>

                        {/* Status Toggle (Activate / Deactivate) */}
                        <Button
                          variant={u.isActive ? "destructive" : "secondary"}
                          size="sm"
                          disabled={isOperating || !canModifyTarget}
                          onClick={() => handleToggleStatus(u)}
                          className="text-xs h-8"
                          title={
                            isSelf
                              ? "Cannot deactivate own account"
                              : !canModifyTarget
                              ? "Only Super Admins can deactivate Super Admin accounts"
                              : u.isActive
                              ? "Deactivate account"
                              : "Activate account"
                          }
                        >
                          {u.isActive ? (
                            <>
                              <UserX className="h-3.5 w-3.5 mr-1" /> Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-3.5 w-3.5 mr-1" /> Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-36 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Users className="h-8 w-8 opacity-40" />
                    <span>No user accounts found matching your filter.</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
