import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import { getProposal } from "@/lib/crm/queries";

export const metadata: Metadata = { title: "Detail Proposal" };

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proposal = await getProposal(id);
  if (!proposal) notFound();
  return <div className="page-shell narrow-page"><header className="page-header"><div><p className="section-index">Proposal detail</p><h1>{proposal.title}</h1><p>{proposal.proposal_number || "Tanpa nomor proposal"}</p></div><Link className="button button-quiet" href="/proposals">Kembali</Link></header><section className="panel proposal-detail"><header className="panel-header"><div><p className="section-index">Status dokumen</p><h2>{formatCurrency(proposal.value)}</h2></div><StatusBadge status={proposal.status} /></header><dl className="detail-list"><div><dt>Lead</dt><dd><Link href={`/leads/${proposal.lead_id}`}>{proposal.leads?.name ?? "Buka lead"}</Link></dd></div><div><dt>Perusahaan</dt><dd>{proposal.leads?.company_name || "Belum diisi"}</dd></div><div><dt>Tanggal kirim</dt><dd>{formatDate(proposal.sent_at)}</dd></div><div><dt>Berlaku sampai</dt><dd>{formatDate(proposal.valid_until)}</dd></div><div><dt>Catatan</dt><dd>{proposal.notes || "Tidak ada catatan."}</dd></div></dl>{proposal.file_url ? <a className="button button-primary" href={proposal.file_url} target="_blank" rel="noreferrer">Buka dokumen proposal</a> : <p className="muted-copy">Tautan dokumen belum ditambahkan.</p>}</section></div>;
}
