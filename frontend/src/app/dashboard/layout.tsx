import Sidebar from "@/components/Sidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchContainer from "@/components/SearchContainer";


export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the user's role from session (server-side)
  const session = await getServerSession(authOptions);
  const role = session?.user?.role || "customer"; // fallback

  return (
    <div className="flex min-h-screen bg-gray-50">
        <Sidebar role={role} />
        <main className="flex-1 p-8">
            <SearchContainer />
            {children}
        </main>
    </div>
  );
}