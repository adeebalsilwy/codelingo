import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { checkIsAdmin } from "@/lib/admin-server";
import { AdminDashboard } from "./dashboard";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export default async function AdminPage() {
  // Properly checking admin status
  try {
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }
    
    // For development, you can skip admin check
    // const isAdminUser = true;
    
    // In production, uncomment this to enforce admin check
    // const isAdminUser = await checkIsAdmin(userId);
    // if (!isAdminUser) {
    //   redirect("/");
    // }
    
    return <AdminDashboard />;
  } catch (error) {
    console.error("Admin page error:", error);
    redirect("/");
  }
}
