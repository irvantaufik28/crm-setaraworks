"use client";

export default function CrmError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="page-shell">
      <div className="error-state" role="alert">
        <strong>Data tidak dapat dimuat</strong>
        <p>Periksa koneksi Supabase atau coba muat ulang halaman.</p>
        <button className="button button-primary" type="button" onClick={reset}>Coba lagi</button>
      </div>
    </div>
  );
}

