import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadForm } from "@/components/forms/lead-form";
import { getLead } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Edit Lead" };

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getLead(id);
  if (!data) notFound();
  return <div className="page-shell narrow-page"><header className="page-header"><div><p className="section-index">Edit lead</p><h1>{data.lead.name}</h1><p>Perbarui identitas, kontak, dan informasi sales.</p></div><Link className="button button-quiet" href={`/leads/${id}`}>Kembali</Link></header><LeadForm lead={data.lead} /></div>;
}

