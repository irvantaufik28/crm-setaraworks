import { format, formatDistanceToNowStrict } from "date-fns";
import { id } from "date-fns/locale";

export function formatCurrency(value: number | null | undefined) {
  if (value == null) return "Belum diisi";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null | undefined, withTime = false) {
  if (!value) return "Belum dijadwalkan";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak valid";
  return format(date, withTime ? "d MMM yyyy, HH:mm" : "d MMM yyyy", { locale: id });
}

export function formatRelativeDate(value: string | null | undefined) {
  if (!value) return "Belum ada aktivitas";
  return formatDistanceToNowStrict(new Date(value), { addSuffix: true, locale: id });
}

export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return "";
  return format(new Date(value), "yyyy-MM-dd'T'HH:mm");
}

