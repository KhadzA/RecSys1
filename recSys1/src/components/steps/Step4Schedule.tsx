import React from "react";
import type { FormState } from "../../types/form";

const SOURCES = [
  "Facebook",
  "LinkedIn",
  "Instagram",
  "JobStreet",
  "Indeed",
  "Referral",
  "Company Website",
  "Walk-in",
  "Other",
];

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
  onToggleArray: (field: "referralSource", value: string) => void;
}

const today = new Date().toISOString().split("T")[0];

const slots = [
  { n: 1, label: "Slot 1", note: "Required", required: true },
  { n: 2, label: "Slot 2", note: "Optional", required: false },
  { n: 3, label: "Slot 3", note: "Optional", required: false },
];

const Step4Schedule: React.FC<Props> = ({
  state,
  errors,
  onChange,
  onToggleArray,
}) => (
  <div className="step-section active">
    <div className="section-heading">Preferred Interview Schedule</div>
    <div className="section-sub">
      Provide 3 preferred date and time options for your interview.
    </div>

    {slots.map(({ n, label, note, required }) => {
      const dateKey = `slot${n}Date` as keyof FormState;
      const timeKey = `slot${n}Time` as keyof FormState;
      return (
        <div key={n} className="priority-card">
          <div className="priority-header">
            <div className="priority-num">{n}</div>
            <div className="priority-label">{label}</div>
            <div className="priority-note">{note}</div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Date {required && <span className="req">*</span>}</label>
              <input
                type="date"
                min={today}
                value={state[dateKey] as string}
                onChange={(e) => onChange(dateKey, e.target.value)}
                className={errors[dateKey] ? "input-error" : ""}
              />
              {errors[dateKey] && (
                <div className="field-error">{errors[dateKey]}</div>
              )}
            </div>
            <div className="field">
              <label>Time {required && <span className="req">*</span>}</label>
              <input
                type="time"
                value={state[timeKey] as string}
                onChange={(e) => onChange(timeKey, e.target.value)}
                className={errors[timeKey] ? "input-error" : ""}
              />
              {errors[timeKey] && (
                <div className="field-error">{errors[timeKey]}</div>
              )}
            </div>
          </div>
        </div>
      );
    })}

    <div className="divider" />

    <div className="field">
      <label>Where did you hear about this opening?</label>
      <div className="tag-group" style={{ marginBottom: 10 }}>
        {SOURCES.map((s) => (
          <React.Fragment key={s}>
            <input
              type="checkbox"
              id={`src-${s}`}
              checked={state.referralSource.includes(s)}
              onChange={() => onToggleArray("referralSource", s)}
            />
            <label htmlFor={`src-${s}`}>{s}</label>
          </React.Fragment>
        ))}
      </div>
      <input
        type="text"
        placeholder="If Referral — enter Sharer Code (optional)"
        value={state.referralCode}
        onChange={(e) => onChange("referralCode", e.target.value)}
        style={{ marginTop: 4 }}
      />
    </div>
  </div>
);

export default Step4Schedule;
