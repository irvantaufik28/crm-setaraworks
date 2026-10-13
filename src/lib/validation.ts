import { z } from "zod";
import { ACTIVITY_TYPES, LEAD_SOURCES, LEAD_STATUSES, PROPOSAL_STATUSES, SERVICES } from "@/lib/constants";

const optionalText = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().trim().nullable(),
);

const optionalNumber = z.preprocess(
  (value) => (value === "" || value == null ? null : Number(value)),
  z.number().nonnegative("Nilai tidak boleh negatif.").nullable(),
);

const optionalDate = z.preprocess(
  (value) => (typeof value === "string" && value.trim() === "" ? null : value),
  z.string().nullable(),
);

export const loginSchema = z.object({
  email: z.email("Gunakan alamat email yang valid.").trim(),
  password: z.string().min(8, "Kata sandi minimal 8 karakter."),
});

export const leadSchema = z
  .object({
    id: optionalText,
    name: z.string().trim().min(2, "Nama lead minimal 2 karakter."),
    company_name: optionalText,
    phone: optionalText,
    whatsapp: optionalText,
    email: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? null : value),
      z.email("Format email tidak valid.").nullable(),
    ),
    instagram: optionalText,
    website: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? null : value),
      z.url("Gunakan URL lengkap, misalnya https://example.com.").nullable(),
    ),
    location: optionalText,
    source: z.enum(LEAD_SOURCES.map((item) => item.value)),
    service_interest: z.enum(SERVICES),
    budget_min: optionalNumber,
    budget_max: optionalNumber,
    estimated_value: optionalNumber,
    status: z.enum(LEAD_STATUSES.map((item) => item.value)),
    last_contact_at: optionalDate,
    next_follow_up_at: optionalDate,
    notes: optionalText,
  })
  .refine(
    ({ budget_min, budget_max }) =>
      budget_min == null || budget_max == null || budget_max >= budget_min,
    { message: "Budget maksimum harus sama atau lebih besar dari budget minimum.", path: ["budget_max"] },
  );

export const activitySchema = z.object({
  lead_id: z.uuid(),
  type: z.enum(ACTIVITY_TYPES.map((item) => item.value)),
  note: z.string().trim().min(3, "Catatan aktivitas minimal 3 karakter."),
  activity_at: z.string().min(1, "Tanggal aktivitas wajib diisi."),
});

export const followUpSchema = z.object({
  lead_id: z.uuid("Pilih lead."),
  type: z.enum(ACTIVITY_TYPES.map((item) => item.value)),
  scheduled_at: z.string().min(1, "Jadwal follow-up wajib diisi."),
  note: optionalText,
});

export const proposalSchema = z.object({
  lead_id: z.uuid("Pilih lead."),
  proposal_number: optionalText,
  title: z.string().trim().min(3, "Judul proposal minimal 3 karakter."),
  value: z.coerce.number().positive("Nilai proposal harus lebih dari nol."),
  status: z.enum(PROPOSAL_STATUSES.map((item) => item.value)),
  sent_at: optionalDate,
  valid_until: optionalDate,
  file_url: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? null : value),
    z.url("Gunakan URL file yang valid.").nullable(),
  ),
  notes: optionalText,
});

export type ActionState = {
  status: "idle" | "error" | "success";
  message?: string;
  errors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { status: "idle" };

