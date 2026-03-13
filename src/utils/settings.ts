import { supabase } from "./supabase";
import type { Settings } from "../types/settings";
import { defaultSettings } from "../types/settings";
import * as XLSX from "xlsx";

export async function fetchSettings(): Promise<Settings> {
  const { data, error } = await supabase.from("settings").select("key, value");
  if (error) throw new Error(error.message);

  const map: Record<string, string> = {};
  (data ?? []).forEach(({ key, value }) => {
    map[key] = value;
  });

  return {
    sync_enabled:
      map["sync_enabled"] !== undefined
        ? map["sync_enabled"] === "true"
        : defaultSettings.sync_enabled,
  };
}

export async function updateSetting(
  key: keyof Settings,
  value: string,
): Promise<void> {
  const { error } = await supabase
    .from("settings")
    .upsert({ key, value }, { onConflict: "key" });
  if (error) throw new Error(error.message);
}

export async function exportApplicationsToExcel(status = "All"): Promise<void> {
  let query = supabase
    .from("applications")
    .select("*")
    .order("created_at", { ascending: false });

  if (status !== "All") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) throw new Error("No applications to export.");

  const rows = data.map((r) => ({
    Timestamp: r.created_at,
    Status: r.status,
    "Full Name": r.full_name,
    Email: r.email,
    Phone: r.phone,
    Address: r.address,
    Positions: r.positions,
    "Employment Type": r.employment_type,
    "Work Setup": r.work_setup,
    "Work Schedule": r.work_schedule,
    "Education Level": r.education_level,
    School: r.school,
    Course: r.course,
    Skills: r.skills,
    Tools: r.tools,
    "Interview Slots": r.interview_slots,
    "Referral Source": r.referral_source,
    "Resume Link": r.resume_link,
    "Portfolio Link": r.portfolio_link,
    "Video Link": r.video_link,
    Notes: r.notes,
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Applications");

  const date = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `upstaff-applications-${date}.xlsx`);
}
