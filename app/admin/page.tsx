import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";
import { AdminDashboard } from "./dashboard";

export default async function AdminPage() {
  const { userId } = auth();
  const isAdminUser = await checkIsAdmin(userId);

  if (!isAdminUser) {
    redirect("/");
  }

  return <AdminDashboard />;
}
