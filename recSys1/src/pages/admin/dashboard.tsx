import { useState, useEffect } from "react";
import {
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { fetchApplications, type Application } from "../../utils/auth";
import "/src/styles/apply.css";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  Interviewed: { bg: "rgba(5,150,105,0.12)", color: "#059669" },
  Hired: { bg: "rgba(37,99,235,0.12)", color: "#2563eb" },
  Rejected: { bg: "rgba(220,38,38,0.12)", color: "#dc2626" },
};

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchApplications();
      setApps(data.reverse());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = apps.filter((a) =>
    [a.fullName, a.email, a.positions, a.status]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  const counts = apps.reduce(
    (acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <AdminLayout>
      <div className="wrapper" style={{ maxWidth: 1000 }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 32,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div className="page-title" style={{ marginBottom: 4 }}>
              Admin <span>Dashboard</span>
            </div>
            <div className="page-sub" style={{ marginBottom: 0 }}>
              {apps.length} total application{apps.length !== 1 ? "s" : ""}
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={load}
            disabled={loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 18px",
            }}
          >
            <RefreshCw
              size={14}
              style={{
                animation: loading ? "spin 1s linear infinite" : "none",
              }}
            />
            Refresh
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 14,
            marginBottom: 32,
          }}
        >
          {["Pending", "Interviewed", "Hired", "Rejected"].map((s) => (
            <div
              key={s}
              className="form-card"
              style={{ padding: "18px 22px", textAlign: "center" }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  fontFamily: "Syne, sans-serif",
                  color: STATUS_STYLES[s]?.color,
                }}
              >
                {counts[s] || 0}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
              >
                {s}
              </div>
            </div>
          ))}
        </div>

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
              placeholder="Search by name, email, position, or status…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 40 }}
            />
          </div>
        </div>

        {loading && (
          <div
            className="form-card"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--muted)",
            }}
          >
            Loading applications…
          </div>
        )}
        {!loading && error && (
          <div
            className="form-card"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--error)",
            }}
          >
            {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div
            className="form-card"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--muted)",
            }}
          >
            No applications found.
          </div>
        )}

        {!loading &&
          !error &&
          filtered.map((app, i) => {
            const isOpen = expanded === i;
            const style = STATUS_STYLES[app.status] || {
              bg: "rgba(100,116,139,0.1)",
              color: "#64748b",
            };
            return (
              <div
                key={i}
                className="form-card"
                style={{ padding: 0, marginBottom: 12, overflow: "hidden" }}
              >
                <div
                  onClick={() => setExpanded(isOpen ? null : i)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 24px",
                    cursor: "pointer",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: style.bg,
                      color: style.color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.status}
                  </span>
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        fontFamily: "Syne, sans-serif",
                        color: "var(--text)",
                      }}
                    >
                      {app.fullName || "—"}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 2,
                      }}
                    >
                      {app.positions?.split("\n")[0]?.replace("• ", "") ||
                        "No position"}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      minWidth: 180,
                    }}
                  >
                    {app.email}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--muted)",
                      opacity: 0.6,
                      marginLeft: "auto",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {app.timestamp}
                  </div>
                  <div style={{ color: "var(--muted)", opacity: 0.5 }}>
                    {isOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border)",
                      padding: "24px 24px 20px",
                    }}
                  >
                    <div className="grid-2" style={{ gap: 24 }}>
                      <Detail label="Phone" value={app.phone} />
                      <Detail label="Address" value={app.address} />
                      <Detail
                        label="Employment Type"
                        value={app.employmentType}
                      />
                      <Detail label="Work Setup" value={app.workSetup} />
                      <Detail label="Work Schedule" value={app.workSchedule} />
                      <Detail
                        label="Education"
                        value={`${app.educationLevel}${app.school ? ` — ${app.school}` : ""}${app.course ? `, ${app.course}` : ""}`}
                      />
                      <Detail label="Skills" value={app.skills} pre />
                      <Detail label="Tools" value={app.tools} pre />
                      <Detail
                        label="Interview Slots"
                        value={app.interviewSlots}
                        pre
                      />
                      <Detail
                        label="Referral Source"
                        value={app.referralSource}
                      />
                      {app.resumeLink && (
                        <LinkDetail
                          label="Resume / Docs"
                          href={app.resumeLink}
                        />
                      )}
                      {app.portfolioLink && (
                        <LinkDetail
                          label="Portfolio"
                          href={app.portfolioLink}
                        />
                      )}
                      {app.videoLink && (
                        <LinkDetail label="Video Intro" href={app.videoLink} />
                      )}
                      {app.notes && <Detail label="Notes" value={app.notes} />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AdminLayout>
  );
}

function Detail({
  label,
  value,
  pre,
}: {
  label: string;
  value: string;
  pre?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="field">
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--muted)",
          opacity: 0.6,
        }}
      >
        {label}
      </label>
      {pre ? (
        <pre
          style={{
            fontSize: 13,
            color: "var(--text)",
            fontFamily: "DM Sans, sans-serif",
            whiteSpace: "pre-wrap",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {value}
        </pre>
      ) : (
        <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
          {value}
        </div>
      )}
    </div>
  );
}

function LinkDetail({ label, href }: { label: string; href: string }) {
  return (
    <div className="field">
      <label
        style={{
          fontSize: 11,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          color: "var(--muted)",
          opacity: 0.6,
        }}
      >
        {label}
      </label>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        style={{
          fontSize: 13,
          color: "var(--accent)",
          display: "flex",
          alignItems: "center",
          gap: 5,
          textDecoration: "none",
        }}
      >
        Open link <ExternalLink size={12} />
      </a>
    </div>
  );
}
