import { AppShell } from "@/components/app-shell";
import { getAdmin } from "@/lib/auth";

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await getAdmin();
  return <AppShell adminName={profile.full_name || "Admin"} adminEmail={profile.email}>{children}</AppShell>;
}

