import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";
import { AdminDashboard } from "./dashboard";

export default async function AdminPage() {
  // Skip admin check - allow access for everyone
  const isAdminUser = true;

  return <AdminDashboard />;
}
