import React, { useState } from "react";
import {
  GraduationCap,
  Wrench,
  MonitorSmartphone,
  X,
  ChevronDown,
} from "lucide-react";
import type { FormState } from "../../types/form";

const TOOLS = [
  "MS Office",
  "Google Workspace",
  "QuickBooks",
  "Xero",
  "Canva",
  "Adobe Suite",
  "Slack",
  "Trello / Asana",
  "Shopify",
  "Notion",
  "Zoom / Teams",
  "ChatGPT / AI tools",
];

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
  onToggleArray: (field: "tools", value: string) => void;
  onSetSkills: (skills: string[]) => void;
}

const Step3Experience: React.FC<Props> = ({
  state,
  errors,
  onChange,
  onToggleArray,
  onSetSkills,
}) => {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (raw: string) => {
    const val = raw.replace(/,/g, "").trim();
    if (val && !state.skills.includes(val)) {
      onSetSkills([...state.skills, val]);
    }
    setSkillInput("");
  };

  const removeSkill = (i: number) => {
    const next = [...state.skills];
    next.splice(i, 1);
    onSetSkills(next);
  };

  return (
    <div className="step-section active">
      <div className="section-heading">Background & Experience</div>
      <div className="section-sub">
        Tell us about your education, skills, tools, and any relevant
        background.
      </div>

      <div className="sub-heading">
        <GraduationCap
          size={16}
          style={{
            display: "inline",
            marginRight: 6,
            verticalAlign: "text-bottom",
          }}
        />
        Education
      </div>
      <div className="sub-desc">Your highest educational attainment.</div>
      <div className="grid-2" style={{ marginBottom: 26 }}>
        <div className="field">
          <label>
            Education Level <span className="req">*</span>
          </label>
          <div style={{ position: "relative" }}>
            <select
              value={state.educationLevel}
              onChange={(e) => onChange("educationLevel", e.target.value)}
              className={errors.educationLevel ? "input-error" : ""}
              style={{
                paddingRight: "2.5rem",
                appearance: "none",
                WebkitAppearance: "none",
              }}
            >
              <option value="">Select level</option>
              <option>High School Graduate</option>
              <option>Vocational / TESDA</option>
              <option>College Undergraduate</option>
              <option>College Graduate</option>
              <option>Post Graduate</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: "absolute",
                right: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                pointerEvents: "none",
                color: "var(--muted)",
                opacity: 0.5,
              }}
            />
          </div>
          {errors.educationLevel && (
            <div className="field-error">{errors.educationLevel}</div>
          )}
        </div>
        <div className="field">
          <label>School / Institution</label>
          <input
            type="text"
            placeholder="e.g. University of Manila"
            value={state.school}
            onChange={(e) => onChange("school", e.target.value)}
          />
        </div>
        <div className="field col-span-2">
          <label>Course / Program (if applicable)</label>
          <input
            type="text"
            placeholder="e.g. BS Business Administration"
            value={state.course}
            onChange={(e) => onChange("course", e.target.value)}
          />
        </div>
      </div>

      <div className="divider" />

      <div className="sub-heading">
        <Wrench
          size={16}
          style={{
            display: "inline",
            marginRight: 6,
            verticalAlign: "text-bottom",
          }}
        />
        Skills
      </div>
      <div className="sub-desc">
        Type a skill and press <strong>Enter</strong> or <strong>,</strong> to
        add it as a tag.
      </div>
      <div className="field" style={{ marginBottom: 22 }}>
        <label>Technical & Soft Skills</label>
        <div
          className="skill-tag-wrap"
          onClick={() => document.getElementById("skillInput")?.focus()}
        >
          {state.skills.map((s, i) => (
            <span key={i} className="skill-tag">
              {s}
              <span
                className="del"
                onClick={() => removeSkill(i)}
                style={{ display: "flex", alignItems: "center" }}
              >
                <X size={11} strokeWidth={2.5} />
              </span>
            </span>
          ))}
          <input
            id="skillInput"
            className="skill-tag-input"
            placeholder="e.g. MS Excel, Communication…"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addSkill(skillInput);
              }
            }}
            onBlur={() => {
              if (skillInput.trim()) addSkill(skillInput);
            }}
          />
        </div>
        <div className="skill-hint">
          Press Enter or comma after each skill to add it.
        </div>
      </div>

      <div className="divider" />

      <div className="sub-heading">
        <MonitorSmartphone
          size={16}
          style={{
            display: "inline",
            marginRight: 6,
            verticalAlign: "text-bottom",
          }}
        />
        Tools & Software
      </div>
      <div className="sub-desc">Select the tools you are proficient with.</div>
      <div className="field" style={{ marginBottom: 4 }}>
        <label>Commonly Used Tools</label>
        <div className="tag-group">
          {TOOLS.map((t) => (
            <React.Fragment key={t}>
              <input
                type="checkbox"
                id={`tool-${t}`}
                checked={state.tools.includes(t)}
                onChange={() => onToggleArray("tools", t)}
              />
              <label htmlFor={`tool-${t}`}>{t}</label>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="field" style={{ marginTop: 12, marginBottom: 6 }}>
        <label>Other Tools (not listed above)</label>
        <input
          type="text"
          placeholder="e.g. SAP, HubSpot, AutoCAD"
          value={state.otherTools}
          onChange={(e) => onChange("otherTools", e.target.value)}
        />
      </div>
    </div>
  );
};

export default Step3Experience;
