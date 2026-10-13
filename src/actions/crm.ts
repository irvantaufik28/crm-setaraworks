"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import {
  activitySchema,
  followUpSchema,
  leadSchema,
  proposalSchema,
  type ActionState,
} from "@/lib/validation";
import type { LeadStatus } from "@/types/database";

function fields(formData: FormData, names: string[]) {
  return Object.fromEntries(names.map((name) => [name, formData.get(name)]));
}

function errorState(message: string): ActionState {
  return { status: "error", message };
}

export async function saveLeadAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = leadSchema.safeParse(
    fields(formData, [
      "id",
      "name",
      "company_name",
      "phone",
      "whatsapp",
      "email",
      "instagram",
      "website",
      "location",
      "source",
      "service_interest",
      "budget_min",
      "budget_max",
      "estimated_value",
      "status",
      "last_contact_at",
      "next_follow_up_at",
      "notes",
    ]),
  );

  if (!parsed.success) {
    return { status: "error", errors: parsed.error.flatten().fieldErrors };
  }

  const { supabase, user } = await getAdmin();
  const { id, ...payload } = parsed.data;

  if (id) {
    const { error } = await supabase.from("leads").update(payload).eq("id", id);
    if (error) return errorState(`Lead gagal diperbarui: ${error.message}`);
    revalidatePath(`/leads/${id}`);
    revalidatePath("/leads");
    revalidatePath("/pipeline");
    revalidatePath("/dashboard");
    return { status: "success", message: "Perubahan lead tersimpan." };
  }

  const { data, error } = await supabase
    .from("leads")
    .insert({ ...payload, created_by: user.id })
    .select("id")
    .single();
  if (error) return errorState(`Lead gagal dibuat: ${error.message}`);

  redirect(`/leads/${data.id}`);
}

export async function archiveLeadAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const { supabase } = await getAdmin();
  const { error } = await supabase
    .from("leads")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) redirect(`/leads/${id}?error=archive`);
  revalidatePath("/leads");
  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  redirect("/leads?archived=1");
}

export async function updateLeadStatusAction(id: string, status: LeadStatus) {
  const { supabase, user } = await getAdmin();
  const { data: lead, error: readError } = await supabase
    .from("leads")
    .select("status")
    .eq("id", id)
    .single();

  if (readError || !lead) return { ok: false, message: "Lead tidak ditemukan." };
  if (lead.status === status) return { ok: true };

  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) return { ok: false, message: error.message };

  await supabase.from("activities").insert({
    lead_id: id,
    user_id: user.id,
    type: "status_change",
    note: `Status diubah dari ${lead.status} menjadi ${status}.`,
    activity_at: new Date().toISOString(),
  });

  revalidatePath("/pipeline");
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath(`/leads/${id}`);
  return { ok: true };
}

export async function addActivityAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = activitySchema.safeParse(
    fields(formData, ["lead_id", "type", "note", "activity_at"]),
  );
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };

  const { supabase, user } = await getAdmin();
  const { error } = await supabase.from("activities").insert({
    ...parsed.data,
    user_id: user.id,
    activity_at: new Date(parsed.data.activity_at).toISOString(),
  });
  if (error) return errorState(`Aktivitas gagal disimpan: ${error.message}`);

  await supabase
    .from("leads")
    .update({ last_contact_at: new Date(parsed.data.activity_at).toISOString() })
    .eq("id", parsed.data.lead_id);
  revalidatePath(`/leads/${parsed.data.lead_id}`);
  revalidatePath("/dashboard");
  return { status: "success", message: "Aktivitas tercatat." };
}

export async function addFollowUpAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = followUpSchema.safeParse(
    fields(formData, ["lead_id", "type", "scheduled_at", "note"]),
  );
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };

  const { supabase, user } = await getAdmin();
  const scheduledAt = new Date(parsed.data.scheduled_at).toISOString();
  const { error } = await supabase.from("follow_ups").insert({
    ...parsed.data,
    scheduled_at: scheduledAt,
    assigned_to: user.id,
    status: "pending",
  });
  if (error) return errorState(`Follow-up gagal dibuat: ${error.message}`);

  await supabase.from("leads").update({ next_follow_up_at: scheduledAt }).eq("id", parsed.data.lead_id);
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  revalidatePath(`/leads/${parsed.data.lead_id}`);
  return { status: "success", message: "Follow-up dijadwalkan." };
}

export async function completeFollowUpAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const leadId = String(formData.get("lead_id") ?? "");
  const { supabase, user } = await getAdmin();
  const completedAt = new Date().toISOString();

  const { error } = await supabase
    .from("follow_ups")
    .update({ status: "completed", completed_at: completedAt })
    .eq("id", id);
  if (!error) {
    await supabase.from("activities").insert({
      lead_id: leadId,
      user_id: user.id,
      type: "follow_up",
      note: "Follow-up ditandai selesai.",
      activity_at: completedAt,
    });
  }
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  revalidatePath(`/leads/${leadId}`);
}

export async function addProposalAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = proposalSchema.safeParse(
    fields(formData, [
      "lead_id",
      "proposal_number",
      "title",
      "value",
      "status",
      "sent_at",
      "valid_until",
      "file_url",
      "notes",
    ]),
  );
  if (!parsed.success) return { status: "error", errors: parsed.error.flatten().fieldErrors };

  const { supabase, user } = await getAdmin();
  const { error } = await supabase.from("proposals").insert(parsed.data);
  if (error) return errorState(`Proposal gagal disimpan: ${error.message}`);

  await supabase.from("activities").insert({
    lead_id: parsed.data.lead_id,
    user_id: user.id,
    type: "proposal",
    note: `Proposal “${parsed.data.title}” dicatat dengan status ${parsed.data.status}.`,
    activity_at: new Date().toISOString(),
  });
  revalidatePath("/proposals");
  revalidatePath(`/leads/${parsed.data.lead_id}`);
  revalidatePath("/dashboard");
  return { status: "success", message: "Proposal tersimpan." };
}

export async function closeLeadAction(_: ActionState, formData: FormData): Promise<ActionState> {
  const id = String(formData.get("id") ?? "");
  const outcome = String(formData.get("outcome") ?? "");
  const { supabase, user } = await getAdmin();

  if (outcome === "won") {
    const finalValue = Number(formData.get("final_value"));
    const projectName = String(formData.get("project_name") ?? "").trim();
    const closedAt = String(formData.get("closed_at") ?? "");
    if (!projectName || !closedAt || !Number.isFinite(finalValue) || finalValue < 0) {
      return errorState("Nama project, tanggal close, dan nilai final wajib diisi.");
    }

    const { error } = await supabase.from("deals").insert({
      lead_id: id,
      final_value: finalValue,
      project_name: projectName,
      closed_at: closedAt,
      notes: String(formData.get("notes") ?? "") || null,
    });
    if (error) return errorState(`Deal gagal disimpan: ${error.message}`);
    await supabase.from("leads").update({ status: "won", estimated_value: finalValue }).eq("id", id);
  } else if (outcome === "lost") {
    const reason = String(formData.get("lost_reason") ?? "").trim();
    if (!reason) return errorState("Alasan lead kalah wajib dipilih.");
    await supabase.from("leads").update({ status: "lost" }).eq("id", id);
    await supabase.from("activities").insert({
      lead_id: id,
      user_id: user.id,
      type: "status_change",
      note: `Lead ditandai kalah. Alasan: ${reason}.`,
      activity_at: new Date().toISOString(),
    });
  } else {
    return errorState("Hasil penutupan lead tidak valid.");
  }

  revalidatePath(`/leads/${id}`);
  revalidatePath("/dashboard");
  revalidatePath("/reports");
  revalidatePath("/pipeline");
  return { status: "success", message: outcome === "won" ? "Lead ditandai menang." : "Lead ditandai kalah." };
}

