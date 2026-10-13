import type { ActivityType, LeadSource, LeadStatus, ProposalStatus } from "@/types/database";

export const LEAD_STATUSES: Array<{ value: LeadStatus; label: string }> = [
  { value: "new", label: "Lead Baru" },
  { value: "contacted", label: "Dihubungi" },
  { value: "discussion", label: "Diskusi" },
  { value: "proposal_sent", label: "Proposal Terkirim" },
  { value: "negotiation", label: "Negosiasi" },
  { value: "won", label: "Menang" },
  { value: "lost", label: "Kalah" },
];

export const LEAD_SOURCES: Array<{ value: LeadSource; label: string }> = [
  { value: "threads", label: "Threads" },
  { value: "instagram", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "google_maps", label: "Google Maps" },
  { value: "referral", label: "Referral" },
  { value: "direct_outreach", label: "Direct Outreach" },
  { value: "freelance_platform", label: "Platform Freelance" },
  { value: "website", label: "Website" },
  { value: "other", label: "Lainnya" },
];

export const SERVICES = [
  "Company Profile Website",
  "Business Website",
  "Landing Page",
  "Custom Web Application",
  "Internal Business System",
  "E-Commerce",
  "Booking System",
  "CRM",
  "POS",
  "Backend & API",
  "API Integration",
  "Maintenance",
  "System Improvement",
  "Other",
] as const;

export const ACTIVITY_TYPES: Array<{ value: ActivityType; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Telepon" },
  { value: "instagram", label: "Instagram DM" },
  { value: "threads", label: "Threads" },
  { value: "email", label: "Email" },
  { value: "meeting", label: "Pertemuan" },
  { value: "proposal", label: "Proposal" },
  { value: "follow_up", label: "Follow-up" },
  { value: "note", label: "Catatan" },
  { value: "status_change", label: "Perubahan Status" },
];

export const PROPOSAL_STATUSES: Array<{ value: ProposalStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Terkirim" },
  { value: "negotiation", label: "Negosiasi" },
  { value: "accepted", label: "Diterima" },
  { value: "rejected", label: "Ditolak" },
];

export const LOST_REASONS = [
  "Budget terlalu rendah",
  "Tidak ada respon",
  "Memilih vendor lain",
  "Project ditunda",
  "Tidak membutuhkan lagi",
  "Tidak cocok dengan scope",
  "Other",
] as const;

export const statusLabel = (status: LeadStatus) =>
  LEAD_STATUSES.find((item) => item.value === status)?.label ?? status;

export const sourceLabel = (source: LeadSource) =>
  LEAD_SOURCES.find((item) => item.value === source)?.label ?? source;

