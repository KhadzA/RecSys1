import React, { useState, useEffect } from "react";
import type { FormState } from "../../types/form";
import { fetchJobs } from "../../utils/auth";

const WORK_SETUPS = ["On-site", "Remote", "Hybrid"];
const SCHEDULES = [
  "Morning (6AM–2PM)",
  "Mid-shift (2PM–10PM)",
  "Night (10PM–6AM)",
  "Weekends Only",
  "Flexible",
];

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
  onToggleArray: (field: "workSetup" | "workSchedule", value: string) => void;
}

const Step2Position: React.FC<Props> = ({
  state,
  errors,
  onChange,
  onToggleArray,
}) => {
  const [positions, setPositions] = useState<string[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then((jobs) =>
        setPositions(jobs.filter((j) => j.active).map((j) => j.title)),
      )
      .catch(() => setPositions([]))
      .finally(() => setLoadingJobs(false));
  }, []);

  const hasDuplicate = () => {
    const vals = [state.position1, state.position2, state.position3].filter(
      Boolean,
    );
    return vals.length !== new Set(vals).size;
  };

  const positionSelect = (
    field: keyof FormState,
    value: string,
    error?: string,
  ) => {
    const isOptional = field !== "position1";
    return (
      <div className="field">
        <label>Position {!isOptional && <span className="req">*</span>}</label>
        <div style={{ position: "relative" }}>
          <select
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className={error ? "input-error" : ""}
            disabled={loadingJobs}
            style={{
              paddingRight: "2.5rem",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          >
            <option value="">
              {loadingJobs
                ? "Loading positions…"
                : isOptional
                  ? "— No preference (skip)"
                  : "Select a position"}
            </option>
            {positions.map((p) => (
              <option key={p}>{p}</option>
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
        {error && <div className="field-error">{error}</div>}
        {isOptional && value && (
          <button
            type="button"
            onClick={() => onChange(field, "")}
            style={{
              marginTop: 5,
              fontSize: 11.5,
              color: "var(--muted)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: 0.65,
              textDecoration: "underline",
              textUnderlineOffset: 2,
              fontFamily: "Inter, sans-serif",
            }}
          >
            ✕ Clear selection
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="step-section active">
      <div className="section-heading">Position & Availability</div>
      <div className="section-sub">
        Select your top 3 preferred positions and let us know your availability.
      </div>

      <div className="sub-heading">Preferred Positions</div>
      <div className="sub-desc">
        Rank your choices from most preferred (1st) to least (3rd). Each choice
        must be a different position.
      </div>

      {/* 1st Choice */}
      <div className="priority-card">
        <div className="priority-header">
          <div className="priority-num">1</div>
          <div className="priority-label">1st Choice Position</div>
          <div className="priority-note">Most preferred</div>
        </div>
        <div className="grid-2">
          {positionSelect("position1", state.position1, errors.position1)}
          <div className="field">
            <label>
              Employment Type <span className="req">*</span>
            </label>
            <div style={{ position: "relative" }}>
              <select
                value={state.employmentType}
                onChange={(e) => onChange("employmentType", e.target.value)}
                style={{
                  paddingRight: "2.5rem",
                  appearance: "none",
                  WebkitAppearance: "none",
                }}
              >
                <option value="">Select type</option>
                <option>Full-Time</option>
                <option>Part-Time</option>
                <option>Contractual</option>
                <option>Project-Based</option>
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
        </div>
      </div>

      {/* 2nd Choice */}
      <div className="priority-card">
        <div className="priority-header">
          <div className="priority-num">2</div>
          <div className="priority-label">2nd Choice Position</div>
          <div className="priority-note">Optional</div>
        </div>
        {positionSelect("position2", state.position2)}
      </div>

      {/* 3rd Choice */}
      <div className="priority-card">
        <div className="priority-header">
          <div className="priority-num">3</div>
          <div className="priority-label">3rd Choice Position</div>
          <div className="priority-note">Optional</div>
        </div>
        {positionSelect("position3", state.position3)}
      </div>

      {hasDuplicate() && (
        <div
          style={{
            fontSize: 12.5,
            color: "var(--error)",
            marginTop: -6,
            marginBottom: 14,
            background: "rgba(217,53,53,0.06)",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid rgba(217,53,53,0.2)",
          }}
        >
          ⚠ Each position choice must be different.
        </div>
      )}

      <div className="divider" />

      <div className="field">
        <label>Preferred Work Setup</label>
        <div className="tag-group">
          {WORK_SETUPS.map((s) => (
            <React.Fragment key={s}>
              <input
                type="checkbox"
                id={`ws-${s}`}
                checked={state.workSetup.includes(s)}
                onChange={() => onToggleArray("workSetup", s)}
              />
              <label htmlFor={`ws-${s}`}>{s}</label>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="divider" />

      <div className="field">
        <label>Preferred Work Schedule</label>
        <div className="tag-group">
          {SCHEDULES.map((s) => (
            <React.Fragment key={s}>
              <input
                type="checkbox"
                id={`sched-${s}`}
                checked={state.workSchedule.includes(s)}
                onChange={() => onToggleArray("workSchedule", s)}
              />
              <label htmlFor={`sched-${s}`}>{s}</label>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step2Position;
