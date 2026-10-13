import { endOfDay, startOfDay } from "date-fns";
import { getAdmin } from "@/lib/auth";
import type { Activity, FollowUp, Lead, Proposal } from "@/types/database";

export type LeadFilters = {
  query?: string;
  status?: string;
  source?: string;
  service?: string;
  sort?: string;
  page?: string;
};

export async function getLeads(filters: LeadFilters = {}) {
  const { supabase } = await getAdmin();
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;

  let query = supabase
    .from("leads")
    .select("*", { count: "exact" })
    .is("archived_at", null);

  if (filters.query) {
    const safeQuery = filters.query.replaceAll(",", " ").trim();
    query = query.or(
      `name.ilike.%${safeQuery}%,company_name.ilike.%${safeQuery}%,email.ilike.%${safeQuery}%,phone.ilike.%${safeQuery}%`,
    );
  }
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.source) query = query.eq("source", filters.source);
  if (filters.service) query = query.eq("service_interest", filters.service);

  const sortByFollowUp = filters.sort === "follow_up";
  query = query.order(sortByFollowUp ? "next_follow_up_at" : "created_at", {
    ascending: sortByFollowUp,
    nullsFirst: false,
  });

  const { data, count, error } = await query.range(from, from + pageSize - 1);
  if (error) throw new Error(`Gagal memuat lead: ${error.message}`);

  return {
    leads: (data ?? []) as unknown as Lead[],
    count: count ?? 0,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil((count ?? 0) / pageSize)),
  };
}

export async function getAllActiveLeads() {
  const { supabase } = await getAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .is("archived_at", null)
    .order("next_follow_up_at", { ascending: true, nullsFirst: false });
  if (error) throw new Error(`Gagal memuat lead: ${error.message}`);
  return (data ?? []) as unknown as Lead[];
}

export async function getLead(id: string) {
  const { supabase } = await getAdmin();
  const [{ data: lead, error }, { data: activities }, { data: proposals }, { data: followUps }] =
    await Promise.all([
      supabase.from("leads").select("*").eq("id", id).is("archived_at", null).single(),
      supabase
        .from("activities")
        .select("*")
        .eq("lead_id", id)
        .order("activity_at", { ascending: false }),
      supabase
        .from("proposals")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("follow_ups")
        .select("*")
        .eq("lead_id", id)
        .order("scheduled_at", { ascending: false }),
    ]);

  if (error) return null;
  return {
    lead: lead as unknown as Lead,
    activities: (activities ?? []) as unknown as Activity[],
    proposals: (proposals ?? []) as unknown as Proposal[],
    followUps: (followUps ?? []) as unknown as FollowUp[],
  };
}

export async function getDashboardData() {
  const { supabase } = await getAdmin();
  const now = new Date();
  const todayStart = startOfDay(now).toISOString();
  const todayEnd = endOfDay(now).toISOString();

  const [{ data: leads, error: leadError }, { data: followUps, error: followUpError }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("*")
        .is("archived_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("follow_ups")
        .select("*,leads(id,name,company_name,status)")
        .eq("status", "pending")
        .order("scheduled_at", { ascending: true }),
    ]);

  if (leadError) throw new Error(`Gagal memuat dashboard: ${leadError.message}`);
  if (followUpError) throw new Error(`Gagal memuat follow-up: ${followUpError.message}`);

  const typedLeads = (leads ?? []) as unknown as Lead[];
  const typedFollowUps = (followUps ?? []) as unknown as FollowUp[];
  const activeStatuses = new Set(["new", "contacted", "discussion", "proposal_sent", "negotiation"]);

  return {
    leads: typedLeads,
    recentLeads: typedLeads.slice(0, 6),
    followUps: typedFollowUps,
    todayFollowUps: typedFollowUps.filter(
      (item) => item.scheduled_at >= todayStart && item.scheduled_at <= todayEnd,
    ),
    overdueFollowUps: typedFollowUps.filter((item) => item.scheduled_at < todayStart),
    upcomingFollowUps: typedFollowUps.filter((item) => item.scheduled_at > todayEnd).slice(0, 6),
    metrics: {
      total: typedLeads.length,
      new: typedLeads.filter((item) => item.status === "new").length,
      active: typedLeads.filter((item) => activeStatuses.has(item.status)).length,
      proposals: typedLeads.filter((item) => item.status === "proposal_sent").length,
      negotiation: typedLeads.filter((item) => item.status === "negotiation").length,
      won: typedLeads.filter((item) => item.status === "won").length,
      lost: typedLeads.filter((item) => item.status === "lost").length,
      pipelineValue: typedLeads
        .filter((item) => activeStatuses.has(item.status))
        .reduce((sum, item) => sum + (item.estimated_value ?? 0), 0),
      wonValue: typedLeads
        .filter((item) => item.status === "won")
        .reduce((sum, item) => sum + (item.estimated_value ?? 0), 0),
    },
  };
}

export async function getFollowUps() {
  const { supabase } = await getAdmin();
  const { data, error } = await supabase
    .from("follow_ups")
    .select("*,leads(id,name,company_name,status)")
    .order("scheduled_at", { ascending: true });
  if (error) throw new Error(`Gagal memuat follow-up: ${error.message}`);
  return (data ?? []) as unknown as FollowUp[];
}

export async function getProposals() {
  const { supabase } = await getAdmin();
  const { data, error } = await supabase
    .from("proposals")
    .select("*,leads(id,name,company_name)")
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Gagal memuat proposal: ${error.message}`);
  return (data ?? []) as unknown as Proposal[];
}

export async function getProposal(id: string) {
  const { supabase } = await getAdmin();
  const { data, error } = await supabase
    .from("proposals")
    .select("*,leads(id,name,company_name)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as unknown as Proposal;
}

