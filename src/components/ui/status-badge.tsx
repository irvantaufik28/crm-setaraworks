import { statusLabel } from "@/lib/constants";
import type { FollowUpStatus, LeadStatus, ProposalStatus } from "@/types/database";

type Status = LeadStatus | FollowUpStatus | ProposalStatus;

const labels: Partial<Record<Status, string>> = {
  pending: "Menunggu",
  completed: "Selesai",
  missed: "Terlewat",
  cancelled: "Dibatalkan",
  draft: "Draft",
  sent: "Terkirim",
  accepted: "Diterima",
  rejected: "Ditolak",
};

export function StatusBadge({ status }: { status: Status }) {
  const label = labels[status] ?? statusLabel(status as LeadStatus);
  return <span className={`status status-${status}`}>{label}</span>;
}

