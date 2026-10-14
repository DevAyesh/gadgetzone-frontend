import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/admin-guard";

export const metadata: Metadata = {
  title: "GadgetZone Admin Portal",
  description: "Secure administration and store management for GadgetZone",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AdminGuard>{children}</AdminGuard>;
}
