export default function CrmLoading() {
  return (
    <div className="page-shell" role="status" aria-live="polite">
      <div className="loading-block"><strong>Memuat workspace</strong><p>Data CRM sedang diambil dari Supabase.</p></div>
    </div>
  );
}

