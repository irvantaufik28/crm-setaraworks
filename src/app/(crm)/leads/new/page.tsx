import type { Metadata } from "next";
import Link from "next/link";
import { LeadForm } from "@/components/forms/lead-form";

export const metadata: Metadata = { title: "Tambah Lead" };

export default function NewLeadPage() {
  return <div className="page-shell narrow-page"><header className="page-header"><div><p className="section-index">Lead baru</p><h1>Catat peluang baru</h1><p>Isi data yang sudah diketahui. Informasi lain dapat dilengkapi setelah kontak pertama.</p></div><Link className="button button-quiet" href="/leads">Batal</Link></header><LeadForm /></div>;
}

