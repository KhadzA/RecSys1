export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "For Interview": { bg: "#e0f2fe", color: "#0369a1" },
  Interviewed: { bg: "#d1fae5", color: "#059669" },
  "For Client Endorsement": { bg: "#ede9fe", color: "#7c3aed" },
  Hired: { bg: "#dcfce7", color: "#16a34a" },
  Resigned: { bg: "#ffedd5", color: "#ea580c" },
  "Open for other roles": { bg: "#dbeafe", color: "#2563eb" },
  "Could be Revisited": { bg: "#e0f2fe", color: "#0284c7" },
  "For Future Consideration": { bg: "#f1f5f9", color: "#475569" },
  "No Show": { bg: "#fef9c3", color: "#a16207" },
  "Not Qualified": { bg: "#f1f5f9", color: "#64748b" },
  "Duplicate Lead": { bg: "#fae8ff", color: "#a21caf" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};

// HELL NAHHH HOII

export const STATUS_LIST = Object.keys(STATUS_STYLES);
