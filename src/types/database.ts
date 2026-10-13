export type LeadStatus =
  | "new"
  | "contacted"
  | "discussion"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost";

export type LeadSource =
  | "threads"
  | "instagram"
  | "whatsapp"
  | "google_maps"
  | "referral"
  | "direct_outreach"
  | "freelance_platform"
  | "website"
  | "other";

export type FollowUpStatus = "pending" | "completed" | "missed" | "cancelled";
export type ProposalStatus = "draft" | "sent" | "negotiation" | "accepted" | "rejected";
export type ActivityType =
  | "whatsapp"
  | "phone"
  | "instagram"
  | "threads"
  | "email"
  | "meeting"
  | "proposal"
  | "follow_up"
  | "note"
  | "status_change";

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: "admin";
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  name: string;
  company_name: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  instagram: string | null;
  website: string | null;
  location: string | null;
  source: LeadSource;
  service_interest: string;
  budget_min: number | null;
  budget_max: number | null;
  estimated_value: number | null;
  status: LeadStatus;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
}

export interface Activity {
  id: string;
  lead_id: string;
  user_id: string;
  type: ActivityType;
  note: string;
  activity_at: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  assigned_to: string;
  type: ActivityType;
  scheduled_at: string;
  note: string | null;
  status: FollowUpStatus;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, "id" | "name" | "company_name" | "status"> | null;
}

export interface Proposal {
  id: string;
  lead_id: string;
  proposal_number: string | null;
  title: string;
  value: number;
  status: ProposalStatus;
  sent_at: string | null;
  valid_until: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  leads?: Pick<Lead, "id" | "name" | "company_name"> | null;
}

export interface Deal {
  id: string;
  lead_id: string;
  final_value: number;
  closed_at: string;
  project_name: string;
  notes: string | null;
  created_at: string;
}

