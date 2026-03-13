const SHEET_URL = import.meta.env.VITE_SHEET_URL as string;
const TOKEN_KEY = "upstaff_token";

// ── Core POST helper — text/plain avoids CORS preflight ──────────────────────
async function gasPost<T>(body: object): Promise<T> {
  const res = await fetch(SHEET_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error(`Network error: ${res.status}`);

  const data = await res.json();
  if (data.result !== "success")
    throw new Error(data.message || "Request failed");

  return data as T;
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export async function loginAdmin(
  email: string,
  password: string,
): Promise<void> {
  const data = await gasPost<{ result: string; token: string }>({
    action: "login",
    email,
    password,
  });
  sessionStorage.setItem(TOKEN_KEY, data.token);
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ── Applications ──────────────────────────────────────────────────────────────
export async function fetchApplications(
  status = "All",
  page = 1,
  limit = 10,
): Promise<{ data: Application[]; total: number }> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await gasPost<{
    result: string;
    data: Application[];
    total: number;
  }>({
    action: "getData",
    token,
    status,
    page,
    limit,
  });

  return { data: res.data, total: res.total };
}

export async function searchApplications(
  query: string,
): Promise<Application[]> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await gasPost<{ result: string; data: Application[] }>({
    action: "search",
    token,
    query,
  });

  return res.data;
}

export async function fetchCounts(): Promise<Record<string, number>> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const res = await gasPost<{ result: string; counts: Record<string, number> }>(
    {
      action: "getCounts",
      token,
    },
  );
  return res.counts;
}

export async function updateApplicationStatus(
  email: string,
  fullName: string,
  status: string,
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  await gasPost({ action: "updateStatus", token, email, fullName, status });
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
export async function fetchJobs(): Promise<Job[]> {
  const data = await gasPost<{ result: string; data: Job[] }>({
    action: "getJobs",
  });
  return data.data;
}

export async function addJob(title: string): Promise<void> {
  const token = getToken();
  await gasPost({ action: "addJob", token, title });
}

export async function toggleJob(index: number): Promise<void> {
  const token = getToken();
  await gasPost({ action: "toggleJob", token, index });
}

// ── Types ──────────────────────────────────────────────────────────────────────
export interface Job {
  index: number;
  title: string;
  active: boolean;
}

export interface Application {
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
