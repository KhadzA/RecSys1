import { useState, useEffect } from "react";
import {
  Database,
  ToggleLeft,
  ToggleRight,
  Download,
  FileSpreadsheet,
  RefreshCw,
} from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import {
  fetchSettings,
  updateSetting,
  exportApplicationsToExcel,
} from "../../utils/settings";
import { STATUS_LIST } from "../../utils/statuses";
import type { Settings } from "../../types/settings";
import { defaultSettings } from "../../types/settings";
import "/src/styles/apply.css";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("All");
  const [exportError, setExportError] = useState("");

  useEffect(() => {
    fetchSettings()
      .then(setSettings)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSyncToggle = async () => {
    const newVal = !settings.sync_enabled;
    setSettings((prev) => ({ ...prev, sync_enabled: newVal }));
    setSaving("sync_enabled");
    try {
      await updateSetting("sync_enabled", String(newVal));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save.");
      setSettings((prev) => ({ ...prev, sync_enabled: !newVal })); // revert
    } finally {
      setSaving(null);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    setExportError("");
    try {
      await exportApplicationsToExcel(exportStatus);
    } catch (e: unknown) {
      setExportError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="wrapper" style={{ maxWidth: 680 }}>
        <div style={{ marginBottom: 32 }}>
          <div className="page-title" style={{ marginBottom: 4 }}>
            <span>Settings</span>
          </div>
          <div className="page-sub" style={{ marginBottom: 0 }}>
            Manage system preferences and data exports.
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(220,38,38,0.07)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#dc2626",
              borderRadius: 10,
              padding: "10px 14px",
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ color: "var(--muted)", fontSize: 13 }}>
            Loading settings…
          </div>
        ) : (
          <>
            {/* Export */}
            <div className="form-card" style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <FileSpreadsheet size={16} style={{ color: "var(--accent)" }} />
                <div
                  className="section-heading"
                  style={{ fontSize: 15, marginBottom: 0 }}
                >
                  Export Applications
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                <div className="field" style={{ flex: 1, marginBottom: 0 }}>
                  <label>Filter by Status</label>
                  <div style={{ position: "relative" }}>
                    <select
                      value={exportStatus}
                      onChange={(e) => setExportStatus(e.target.value)}
                      style={{
                        paddingRight: "2.5rem",
                        appearance: "none",
                        WebkitAppearance: "none",
                      }}
                    >
                      <option value="All">All Applications</option>
                      {STATUS_LIST.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <div
                      style={{
                        position: "absolute",
                        right: "0.85rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        pointerEvents: "none",
                        color: "var(--muted)",
                        opacity: 0.5,
                        fontSize: 11,
                      }}
                    >
                      ▼
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-primary"
                  onClick={handleExport}
                  disabled={exporting}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    marginBottom: 0,
                  }}
                >
                  {exporting ? (
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />
                  ) : (
                    <Download size={14} />
                  )}
                  {exporting ? "Exporting…" : "Export .xlsx"}
                </button>
              </div>

              {exportError && (
                <div style={{ fontSize: 12, color: "#dc2626", marginTop: 10 }}>
                  {exportError}
                </div>
              )}

              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  marginTop: 10,
                  opacity: 0.7,
                }}
              >
                Downloads a formatted Excel file directly from Supabase. Does
                not require Google Sheets.
              </div>
            </div>

            {/* Sheets Sync */}
            <div className="form-card" style={{ marginBottom: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 20,
                }}
              >
                <Database size={16} style={{ color: "var(--accent)" }} />
                <div
                  className="section-heading"
                  style={{ fontSize: 15, marginBottom: 0 }}
                >
                  Google Sheets Sync
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 0",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "var(--text)",
                    }}
                  >
                    Enable sync
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 3,
                      opacity: 0.7,
                    }}
                  >
                    New submissions and status changes will mirror to Google
                    Sheets automatically.
                  </div>
                </div>
                <button
                  onClick={handleSyncToggle}
                  disabled={saving === "sync_enabled"}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: settings.sync_enabled
                      ? "var(--accent)"
                      : "var(--muted)",
                    opacity: saving === "sync_enabled" ? 0.5 : 0.85,
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {settings.sync_enabled ? (
                    <ToggleRight size={32} />
                  ) : (
                    <ToggleLeft size={32} />
                  )}
                </button>
              </div>

              <div style={{ paddingTop: 14 }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    opacity: 0.6,
                    lineHeight: 1.6,
                  }}
                >
                  The Spreadsheet URL and Supabase keys are configured in Google
                  Apps Script properties — not here. Contact your developer to
                  change them.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
