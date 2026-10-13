"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { updateLeadStatusAction } from "@/actions/crm";
import { LEAD_STATUSES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Lead, LeadStatus } from "@/types/database";

function PipelineCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status },
  });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <article ref={setNodeRef} style={style} className={`pipeline-card ${isDragging ? "dragging" : ""}`}>
      <div className="pipeline-card-top">
        <Link href={`/leads/${lead.id}`}><strong>{lead.name}</strong></Link>
        <button className="drag-handle" type="button" aria-label={`Pindahkan ${lead.name}`} {...listeners} {...attributes}>Pindah</button>
      </div>
      <p>{lead.company_name || "Tanpa nama bisnis"}</p>
      <dl>
        <div><dt>Layanan</dt><dd>{lead.service_interest}</dd></div>
        <div><dt>Potensi</dt><dd>{formatCurrency(lead.estimated_value)}</dd></div>
        <div><dt>Follow-up</dt><dd>{formatDate(lead.next_follow_up_at)}</dd></div>
      </dl>
    </article>
  );
}

function PipelineColumn({ status, label, leads }: { status: LeadStatus; label: string; leads: Lead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={`pipeline-column ${isOver ? "drop-target" : ""}`} aria-labelledby={`column-${status}`}>
      <header><h2 id={`column-${status}`}>{label}</h2><span>{leads.length}</span></header>
      <div className="pipeline-stack">
        {leads.length ? leads.map((lead) => <PipelineCard key={lead.id} lead={lead} />) : <p className="column-empty">Belum ada lead pada tahap ini.</p>}
      </div>
    </section>
  );
}

export function PipelineBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [message, setMessage] = useState("Pilih tombol Pindah pada kartu untuk memindahkan lead dengan mouse atau keyboard.");
  const [isPending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));
  const grouped = useMemo(
    () => Object.fromEntries(LEAD_STATUSES.map(({ value }) => [value, leads.filter((lead) => lead.status === value)])) as Record<LeadStatus, Lead[]>,
    [leads],
  );

  function handleDragEnd(event: DragEndEvent) {
    const leadId = String(event.active.id);
    const target = event.over?.id as LeadStatus | undefined;
    const current = leads.find((lead) => lead.id === leadId);
    if (!target || !current || current.status === target) return;

    const previous = leads;
    setLeads((items) => items.map((lead) => lead.id === leadId ? { ...lead, status: target } : lead));
    const targetLabel = LEAD_STATUSES.find((item) => item.value === target)?.label ?? target;
    setMessage(`${current.name} dipindahkan ke ${targetLabel}. Menyimpan perubahan.`);

    startTransition(async () => {
      const result = await updateLeadStatusAction(leadId, target);
      if (!result.ok) {
        setLeads(previous);
        setMessage(`Perubahan gagal disimpan. ${result.message ?? "Coba lagi."}`);
      } else {
        setMessage(`${current.name} berhasil dipindahkan ke ${targetLabel}.`);
      }
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <p className="sr-only" aria-live="polite">{message}{isPending ? "" : ""}</p>
      <div className="pipeline-board">
        {LEAD_STATUSES.map(({ value, label }) => <PipelineColumn key={value} status={value} label={label} leads={grouped[value]} />)}
      </div>
    </DndContext>
  );
}

