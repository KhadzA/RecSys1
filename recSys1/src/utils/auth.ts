const SHEET_URL = import.meta.env.VITE_SHEET_URL as string;
const TOKEN_KEY = "upstaff_token";

// ── Helper: all requests use POST + text/plain to avoid CORS preflight ──────
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

// ── Login ────────────────────────────────────────────────────────────────────
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

// ── Session helpers ──────────────────────────────────────────────────────────
export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

// ── Fetch applications ───────────────────────────────────────────────────────
export async function fetchApplications(): Promise<Application[]> {
  const token = getToken();
  if (!token) throw new Error("Not logged in");

  const data = await gasPost<{ result: string; data: Application[] }>({
    action: "getData",
    token,
  });

  return data.data;
}

// ── Types ────────────────────────────────────────────────────────────────────
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
