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
import StatusDropdown from "../../components/StatusDropdown";
import {
  fetchApplications,
  fetchCounts,
  searchApplications,
  updateApplicationStatus,
  type Application,
} from "../../utils/auth";
import { STATUS_STYLES, STATUS_LIST } from "../../utils/statuses";

import "/src/styles/apply.css";

const TABS = ["All", ...STATUS_LIST];
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
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = { total: 0 };
    STATUS_LIST.forEach((s) => {
      init[s] = 0;
    });
    return init;
  });
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const load = useCallback(
    async (tab = activeTab, p = page) => {
      setLoading(true);
      setError("");
      setExpanded(null);
      try {
        const [{ data, total }, counts] = await Promise.all([
          fetchApplications(tab, p, LIMIT),
          fetchCounts(),
        ]);
        setApps(data);
        setTotal(total);
        setCounts(counts);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        setLoading(false);
      }
    },
    [activeTab, page],
  );

  useEffect(() => {
    load("All", 1);
  }, []);

  const handleStatusChange = async (
    app: Application,
    i: number,
    newStatus: string,
  ) => {
    setUpdatingStatus(i);
    try {
      await updateApplicationStatus(app.email, app.fullName, newStatus);
      setApps((prev) =>
        prev.map((a, idx) => (idx === i ? { ...a, status: newStatus } : a)),
      );
      fetchCounts().then(setCounts);
    } catch {
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdatingStatus(null);
    }
  };

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
                  whiteSpace: "nowrap",
                }}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Counts overview */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 12,
            marginBottom: 24,
          }}
        >
          {[
            { label: "Total", value: counts.total, color: "var(--accent)" },
            ...STATUS_LIST.map((s) => ({
              label: s,
              value: counts[s] ?? 0,
              color: STATUS_STYLES[s].color,
            })),
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="form-card"
              onClick={() => label !== "Total" && switchTab(label)}
              style={{
                padding: "16px 20px",
                textAlign: "center",
                cursor: label !== "Total" ? "pointer" : "default",
                border:
                  activeTab === label && !isSearching
                    ? `1.5px solid ${color}`
                    : undefined,
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 800,
                  fontFamily: "Syne, sans-serif",
                  color,
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--muted)",
                  marginTop: 2,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {label}
              </div>
            </div>
          ))}
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
              placeholder="Search by name, email, position, or status…"
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
              Searching across all applications…
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
            return (
              <div
                key={i}
                className="form-card"
                style={{ padding: 0, marginBottom: 12, overflow: "visible" }}
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
                    borderRadius: isOpen
                      ? "var(--radius) var(--radius) 0 0"
                      : "var(--radius)",
                  }}
                >
                  <div onClick={(e) => e.stopPropagation()}>
                    <StatusDropdown
                      value={app.status}
                      onChange={(newStatus) =>
                        handleStatusChange(app, i, newStatus)
                      }
                      disabled={updatingStatus === i}
                    />
                  </div>
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

        {/* Pagination */}
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
      <style>{`@keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }`}</style>
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
  const safeHref =
    href.startsWith("http://") || href.startsWith("https://")
      ? href
      : `https://${href}`;
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
        href={safeHref}
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
