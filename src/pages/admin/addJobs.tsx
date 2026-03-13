import { useState, useEffect } from "react";
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  Briefcase,
  Search,
  X,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { addJob, fetchJobs, toggleJob, type Job } from "../../utils/auth";
import "/src/styles/apply.css";

export default function AddJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchJobs();
      setJobs(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    if (jobs.some((j) => j.title.toLowerCase() === trimmed.toLowerCase())) {
      setError("A job with that title already exists.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addJob(trimmed);
      setTitle("");
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add job.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (index: number) => {
    try {
      await toggleJob(index);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update job.");
    }
  };

  const filtered = query.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(query.toLowerCase()))
    : jobs;

  const active = filtered.filter((j) => j.active);
  const inactive = filtered.filter((j) => !j.active);
  const isFiltering = query.trim().length > 0;

  return (
    <AdminLayout>
      <div className="wrapper" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="page-title" style={{ marginBottom: 4 }}>
            Manage <span>Jobs</span>
          </div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Active jobs appear as options in the applicant form.
          </div>
        </div>

        {/* Add job */}
        <div className="form-card" style={{ marginBottom: 28 }}>
          <div
            className="section-heading"
            style={{ fontSize: 16, marginBottom: 16 }}
          >
            Add New Job
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div className="field" style={{ flex: 1, marginBottom: 0 }}>
              <input
                type="text"
                placeholder="e.g. Social Media Manager"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={saving || !title.trim()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={15} />
              {saving ? "Adding…" : "Add Job"}
            </button>
          </div>
          {error && (
            <div className="field-error" style={{ marginTop: 10 }}>
              {error}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="field" style={{ marginBottom: 20 }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--muted)",
                opacity: 0.5,
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search jobs…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: 40, paddingRight: query ? 36 : 14 }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--muted)",
                  opacity: 0.5,
                  display: "flex",
                  alignItems: "center",
                  padding: 0,
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          {isFiltering && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 6,
                opacity: 0.7,
              }}
            >
              {filtered.length === 0
                ? "No jobs match your search."
                : `${filtered.length} job${filtered.length !== 1 ? "s" : ""} found`}
            </div>
          )}
        </div>

        {/* Active jobs */}
        <div className="form-card" style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 18,
            }}
          >
            <Briefcase size={16} style={{ color: "var(--accent)" }} />
            <div
              className="section-heading"
              style={{ fontSize: 15, marginBottom: 0 }}
            >
              Active Jobs
            </div>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                background: "rgba(62,207,223,0.1)",
                color: "var(--accent)",
                border: "1px solid rgba(62,207,223,0.25)",
                borderRadius: 20,
                padding: "2px 10px",
              }}
            >
              {active.length}
            </span>
          </div>

          {loading && (
            <div
              style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}
            >
              Loading…
            </div>
          )}

          {!loading && active.length === 0 && (
            <div
              style={{
                color: "var(--muted)",
                fontSize: 13,
                opacity: 0.6,
                padding: "8px 0",
              }}
            >
              {isFiltering
                ? "No active jobs match your search."
                : "No active jobs yet. Add one above."}
            </div>
          )}

          {!loading &&
            active.map((job) => (
              <JobRow
                key={job.index}
                job={job}
                query={query}
                onToggle={() => handleToggle(job.index)}
              />
            ))}
        </div>

        {/* Inactive jobs */}
        {!loading && inactive.length > 0 && (
          <div className="form-card">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 18,
              }}
            >
              <div
                className="section-heading"
                style={{ fontSize: 15, marginBottom: 0, opacity: 0.6 }}
              >
                Inactive Jobs
              </div>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 12,
                  background: "rgba(100,116,139,0.1)",
                  color: "#64748b",
                  border: "1px solid rgba(100,116,139,0.2)",
                  borderRadius: 20,
                  padding: "2px 10px",
                }}
              >
                {inactive.length}
              </span>
            </div>
            {inactive.map((job) => (
              <JobRow
                key={job.index}
                job={job}
                query={query}
                onToggle={() => handleToggle(job.index)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(62,207,223,0.25)",
          color: "inherit",
          borderRadius: 3,
          padding: "0 1px",
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function JobRow({
  job,
  query,
  onToggle,
}: {
  job: Job;
  query: string;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "11px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div
        style={{
          flex: 1,
          fontSize: 14,
          color: job.active ? "var(--text)" : "var(--muted)",
          fontWeight: job.active ? 500 : 400,
          opacity: job.active ? 1 : 0.55,
        }}
      >
        {highlight(job.title, query)}
      </div>
      <div
        style={{
          fontSize: 11,
          color: job.active ? "var(--accent)" : "#64748b",
          opacity: 0.7,
        }}
      >
        {job.active ? "Active" : "Inactive"}
      </div>
      <button
        onClick={onToggle}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: job.active ? "var(--accent)" : "var(--muted)",
          opacity: 0.7,
          display: "flex",
          alignItems: "center",
          padding: 0,
        }}
        title={job.active ? "Deactivate" : "Activate"}
      >
        {job.active ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}
      </button>
    </div>
  );
}
