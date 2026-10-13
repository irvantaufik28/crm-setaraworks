import Link from "next/link";

export default function NotFound() {
  return (
    <main className="standalone-state">
      <span>404</span>
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak tersedia di CRM ini.</p>
      <Link className="button button-primary" href="/dashboard">Kembali ke dashboard</Link>
    </main>
  );
}

