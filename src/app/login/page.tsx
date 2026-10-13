import type { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { hasSupabaseEnv } from "@/lib/env";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; setup?: string }>;
}) {
  const params = await searchParams;
  const configured = hasSupabaseEnv();

  return (
    <main className="auth-page">
      <section className="auth-brand" aria-labelledby="login-title">
        <div className="auth-brand-mark"><span>SW</span><strong>SetaraWorks CRM</strong></div>
        <div>
          <p className="section-index">Internal sales workspace</p>
          <h1 id="login-title">Jaga setiap peluang tetap bergerak.</h1>
          <p>Masuk untuk melihat siapa yang perlu di-follow-up, lead yang dekat dengan closing, dan nilai pipeline aktif.</p>
        </div>
        <small>Admin access only</small>
      </section>
      <section className="auth-panel" aria-label="Form login">
        <div className="auth-panel-inner">
          <header><span>LOGIN</span><h2>Selamat datang kembali</h2><p>Gunakan akun admin yang terdaftar di Supabase.</p></header>
          {!configured || params.setup === "required" ? (
            <div className="setup-notice" role="alert">
              <strong>Supabase belum terhubung</strong>
              <p>Salin `.env.example` menjadi `.env.local`, isi project URL dan publishable key, lalu jalankan ulang aplikasi.</p>
            </div>
          ) : null}
          {params.error === "unauthorized" ? <p className="form-message form-message-error" role="alert">Akun ini tidak memiliki akses admin.</p> : null}
          <LoginForm />
        </div>
      </section>
    </main>
  );
}

