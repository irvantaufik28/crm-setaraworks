import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PipelineBoard } from "@/components/pipeline-board";
import { getAllActiveLeads } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Pipeline" };

export default async function PipelinePage() {
  const leads = await getAllActiveLeads();
  return <div className="page-shell pipeline-page"><header className="page-header"><div><p className="section-index">Sales pipeline</p><h1>Gerakkan lead menuju closing</h1><p>Gunakan drag and drop atau tombol Pindah pada setiap kartu. Perubahan langsung tersimpan.</p></div><Link className="button button-primary" href="/leads/new">Tambah lead</Link></header>{leads.length ? <PipelineBoard initialLeads={leads} /> : <div className="panel"><EmptyState title="Pipeline masih kosong" description="Tambahkan lead pertama agar tahapan sales mulai terisi." action={{ href: "/leads/new", label: "Tambah lead pertama" }} /></div>}</div>;
}

