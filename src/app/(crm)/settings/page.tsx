import type { Metadata } from "next";
import { getAdmin } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { profile } = await getAdmin();
  return <div className="page-shell narrow-page"><header className="page-header"><div><p className="section-index">Workspace settings</p><h1>Pengaturan admin</h1><p>Informasi akun dan status keamanan workspace.</p></div></header><section className="panel settings-panel"><header className="panel-header"><div><p className="section-index">Akun aktif</p><h2>{profile.full_name || "Admin SetaraWorks"}</h2></div><span className="status status-won">Admin</span></header><dl className="detail-list"><div><dt>Email</dt><dd>{profile.email}</dd></div><div><dt>Role</dt><dd>Admin / Owner</dd></div><div><dt>Akun dibuat</dt><dd>{formatDate(profile.created_at)}</dd></div><div><dt>Database</dt><dd>Supabase PostgreSQL dengan RLS</dd></div><div><dt>Autentikasi</dt><dd>Supabase Auth, email dan kata sandi</dd></div></dl><div className="settings-note"><strong>Manajemen akun</strong><p>Untuk MVP admin-only, pembuatan user dan reset kata sandi dilakukan dari Supabase Dashboard. Aplikasi tidak menyediakan pendaftaran publik.</p></div></section></div>;
}

