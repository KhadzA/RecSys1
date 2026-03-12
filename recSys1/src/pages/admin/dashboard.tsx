import { useState, useEffect, useCallback, useRef } from "react";
import {
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  fetchApplications,
  searchApplications,
  type Application,
} from "../../utils/auth";
import "/src/styles/apply.css";

const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
  Interviewed: { bg: "rgba(5,150,105,0.12)", color: "#059669" },
  Hired: { bg: "rgba(37,99,235,0.12)", color: "#2563eb" },
  Rejected: { bg: "rgba(220,38,38,0.12)", color: "#dc2626" },
};

const TABS = ["All", "Pending", "Interviewed", "Hired", "Rejected"];
const LIMIT = 10;

export default function Dashboard() {
  const [apps, setApps] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Application[] | null>(
    null,
  );
  const [searching, setSearching] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    async (tab = activeTab, p = page) => {
      setLoading(true);
      setError("");
      setExpanded(null);
      try {
        const { data, total } = await fetchApplications(tab, p, LIMIT);
        setApps(data);
        setTotal(total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, page],
  );

  useEffect(() => {
    load();
  }, []);

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    setSearch("");
    setSearchResults(null);
    setExpanded(null);
    load(tab, 1);
  };

  const goPage = (p: number) => {
    setPage(p);
    setExpanded(null);
    load(activeTab, p);
  };

  // Debounced server-side search
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    if (!val.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const results = await searchApplications(val.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 500);
  };

  const displayed = searchResults ?? apps;
  const totalPages = Math.ceil(total / LIMIT);
  const isSearching = search.trim().length > 0;

  // Summary counts from current tab total
  const tabCounts: Record<string, number> = {};
  TABS.slice(1).forEach((s) => {
    tabCounts[s] = 0;
  });

  return (
    <AdminLayout>
      <div className="wrapper" style={{ maxWidth: 1000 }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div className="page-title" style={{ marginBottom: 4 }}>
              Admin <span>Dashboard</span>
            </div>
            <div className="page-sub" style={{ marginBottom: 0 }}>
              {isSearching
                ? `${searchResults?.length ?? 0} search result${searchResults?.length !== 1 ? "s" : ""}`
                : `${total} ${activeTab !== "All" ? activeTab.toLowerCase() : ""} application${total !== 1 ? "s" : ""}`}
            </div>
          </div>
          <button
            className="btn btn-ghost"
            onClick={() => load()}
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

        {/* Status tabs */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 24,
            flexWrap: "wrap",
          }}
        >
          {TABS.map((tab) => {
            const s = STATUS_STYLES[tab];
            const isActive = activeTab === tab && !isSearching;
            return (
              <button
                key={tab}
                onClick={() => switchTab(tab)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  border: isActive
                    ? `1.5px solid ${s?.color ?? "var(--accent)"}`
                    : "1.5px solid var(--border)",
                  background: isActive
                    ? (s?.bg ?? "rgba(62,207,223,0.12)")
                    : "transparent",
                  color: isActive
                    ? (s?.color ?? "var(--accent)")
                    : "var(--muted)",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="field" style={{ marginBottom: 24 }}>
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
            {searching && (
              <RefreshCw
                size={13}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--muted)",
                  animation: "spin 1s linear infinite",
                }}
              />
            )}
            <input
              type="text"
              placeholder="Search all applicants by name, email, position, or status…"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ paddingLeft: 40, paddingRight: 36 }}
            />
          </div>
          {isSearching && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                marginTop: 6,
                opacity: 0.7,
              }}
            >
              Searching across all applications in the sheet…
            </div>
          )}
        </div>

        {/* States */}
        {(loading || searching) && !isSearching && (
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
        {!loading && !error && displayed.length === 0 && (
          <div
            className="form-card"
            style={{
              textAlign: "center",
              padding: "48px 24px",
              color: "var(--muted)",
            }}
          >
            {isSearching ? "No results found." : "No applications yet."}
          </div>
        )}

        {/* Cards */}
        {!loading &&
          !error &&
          displayed.map((app, i) => {
            const isOpen = expanded === i;
            const style = STATUS_STYLES[app.status] ?? {
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

        {/* Pagination — only when not searching */}
        {!isSearching && totalPages > 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 24,
            }}
          >
            <button
              className="btn btn-ghost"
              onClick={() => goPage(page - 1)}
              disabled={page === 1 || loading}
              style={{
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goPage(p)}
                disabled={loading}
                className="btn"
                style={{
                  padding: "7px 13px",
                  fontSize: 13,
                  background: p === page ? "var(--accent)" : "transparent",
                  color: p === page ? "#fff" : "var(--muted)",
                  border: p === page ? "none" : "1.5px solid var(--border)",
                  borderRadius: 8,
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="btn btn-ghost"
              onClick={() => goPage(page + 1)}
              disabled={page === totalPages || loading}
              style={{
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        )}
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
