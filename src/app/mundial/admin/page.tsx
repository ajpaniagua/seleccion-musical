import { isAdmin } from "@/lib/adminAuth";
import { AdminLogin } from "./AdminLogin";
import { AdminDashboard } from "./AdminDashboard";

export const metadata = {
  title: "Dashboard · La selección musical de mi vida",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const autenticado = await isAdmin();
  if (!autenticado) return <AdminLogin />;
  return <AdminDashboard />;
}
