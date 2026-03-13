import { supabase } from "./supabase";
import { STATUS_LIST } from "./statuses";

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut();
}

// ── Applications ──────────────────────────────────────────────────────────────
export async function fetchApplications(
  status = "All",
  page = 1,
  limit = 10,
): Promise<{ data: Application[]; total: number }> {
  let query = supabase
    .from("applications")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (status !== "All") query = query.eq("status", status);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  return { data: (data ?? []).map(mapRow), total: count ?? 0 };
}

export async function searchApplications(
  query: string,
): Promise<Application[]> {
  const q = query.toLowerCase();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .or(
      `full_name.ilike.%${q}%,email.ilike.%${q}%,positions.ilike.%${q}%,status.ilike.%${q}%`,
    )
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRow);
}

export async function fetchCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("applications").select("status");
  if (error) throw new Error(error.message);

  const counts: Record<string, number> = { total: 0 };
  STATUS_LIST.forEach((s) => {
    counts[s] = 0;
  });
  (data ?? []).forEach(({ status }) => {
    if (counts[status] !== undefined) counts[status]++;
    counts.total++;
  });

  return counts;
}

export async function updateApplicationStatus(
  email: string,
  fullName: string,
  status: string,
): Promise<void> {
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("email", email)
    .eq("full_name", fullName);

  if (error) throw new Error(error.message);
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export async function fetchJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    index: row.id,
    title: row.title,
    active: row.active,
  }));
}

export async function addJob(title: string): Promise<void> {
  const { error } = await supabase.from("jobs").insert({ title, active: true });
  if (error) throw new Error(error.message);
}

export async function toggleJob(id: string): Promise<void> {
  const { data } = await supabase
    .from("jobs")
    .select("active")
    .eq("id", id)
    .single();
  const { error } = await supabase
    .from("jobs")
    .update({ active: !data?.active })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

// ── Row mapper ────────────────────────────────────────────────────────────────
function mapRow(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    timestamp: row.created_at as string,
    status: row.status as string,
    fullName: row.full_name as string,
    email: row.email as string,
    phone: row.phone as string,
    address: row.address as string,
    positions: row.positions as string,
    employmentType: row.employment_type as string,
    workSetup: row.work_setup as string,
    workSchedule: row.work_schedule as string,
    educationLevel: row.education_level as string,
    school: row.school as string,
    course: row.course as string,
    skills: row.skills as string,
    tools: row.tools as string,
    interviewSlots: row.interview_slots as string,
    referralSource: row.referral_source as string,
    resumeLink: row.resume_link as string,
    portfolioLink: row.portfolio_link as string,
    videoLink: row.video_link as string,
    notes: row.notes as string,
  };
}

// ── Types ─────────────────────────────────────────────────────────────────────
export interface Job {
  index: string;
  title: string;
  active: boolean;
}

export interface Application {
  id: string;
  timestamp: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  positions: string;
  employmentType: string;
  workSetup: string;
  workSchedule: string;
  educationLevel: string;
  school: string;
  course: string;
  skills: string;
  tools: string;
  interviewSlots: string;
  referralSource: string;
  resumeLink: string;
  portfolioLink: string;
  videoLink: string;
  notes: string;
}
