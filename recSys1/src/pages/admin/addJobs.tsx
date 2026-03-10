import { useState, useEffect } from "react";
import { Plus, ToggleLeft, ToggleRight, Briefcase } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { addJob, fetchJobs, toggleJob, type Job } from "../../utils/auth";
import "/src/styles/apply.css";

export default function AddJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");

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

  const active = jobs.filter((j) => j.active);
  const inactive = jobs.filter((j) => !j.active);

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
              No active jobs yet. Add one above.
            </div>
          )}

          {!loading &&
            active.map((job) => (
              <JobRow
                key={job.index}
                job={job}
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
                onToggle={() => handleToggle(job.index)}
              />
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

function JobRow({ job, onToggle }: { job: Job; onToggle: () => void }) {
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
        {job.title}
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
