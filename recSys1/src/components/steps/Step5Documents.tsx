import React from "react";
import { FolderOpen, ImageIcon, Video, Link } from "lucide-react";
import type { FormState } from "../../types/form";

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
}

const Step5Documents: React.FC<Props> = ({ state, errors, onChange }) => (
  <div className="step-section active">
    <div className="section-heading">Documents & Links</div>
    <div className="section-sub">
      Paste links to your documents. You can use Google Drive, Dropbox,
      OneDrive, or any public link.
    </div>

    {/* Resume */}
    <div className="doc-link-card">
      <div className="doc-link-header">
        <span className="doc-link-icon">
          <FolderOpen size={20} />
        </span>
        <div>
          <div className="doc-link-title">
            Resume / CV &amp; Certificates{" "}
            <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
          </div>
          <div className="doc-link-desc">
            Upload both your resume and certificates into{" "}
            <strong>one Google Drive folder</strong>, then paste the shared
            folder link below.
          </div>
        </div>
      </div>
      <div
        style={{
          background: "rgba(123,225,239,0.05)",
          border: "1px solid rgba(123,225,239,0.18)",
          borderRadius: 10,
          padding: "13px 15px",
          marginBottom: 14,
          fontSize: 12.5,
          color: "var(--muted)",
          lineHeight: 1.8,
        }}
      >
        <strong style={{ color: "var(--navy)" }}>
          📌 How to name your files before uploading:
        </strong>
        <br />
        &nbsp;&nbsp;• Resume →{" "}
        <code
          style={{
            background: "rgba(123,225,239,0.12)",
            padding: "1px 6px",
            borderRadius: 4,
            color: "var(--text)",
          }}
        >
          Firstname_Lastname_Resume.pdf
        </code>
        <br />
        &nbsp;&nbsp;• Diploma / TOR →{" "}
        <code
          style={{
            background: "rgba(123,225,239,0.12)",
            padding: "1px 6px",
            borderRadius: 4,
            color: "var(--text)",
          }}
        >
          Firstname_Lastname_Diploma.pdf
        </code>
        <br />
        &nbsp;&nbsp;• Certificate →{" "}
        <code
          style={{
            background: "rgba(123,225,239,0.12)",
            padding: "1px 6px",
            borderRadius: 4,
            color: "var(--text)",
          }}
        >
          Firstname_Lastname_CertName.pdf
        </code>
      </div>
      <div className="field">
        <label>
          Shared Folder Link <span className="req">*</span>
        </label>
        <div className="link-input-wrap">
          <span className="link-icon">
            <Link size={15} />
          </span>
          <input
            type="url"
            placeholder="https://drive.google.com/drive/folders/..."
            value={state.resumeLink}
            onChange={(e) => onChange("resumeLink", e.target.value)}
            className={errors.resumeLink ? "input-error" : ""}
          />
        </div>
        {errors.resumeLink && (
          <div className="field-error">{errors.resumeLink}</div>
        )}
      </div>
    </div>

    {/* Portfolio */}
    <div className="doc-link-card">
      <div className="doc-link-header">
        <span className="doc-link-icon">
          <ImageIcon size={20} />
        </span>
        <div>
          <div className="doc-link-title">Portfolio / Work Samples</div>
          <div className="doc-link-desc">
            Link to your portfolio, Behance, GitHub, or sample work folder
          </div>
        </div>
        <div className="doc-optional">Optional</div>
      </div>
      <div className="field">
        <div className="link-input-wrap">
          <span className="link-icon">
            <Link size={15} />
          </span>
          <input
            type="url"
            placeholder="https://behance.net/yourprofile or GitHub link"
            value={state.portfolioLink}
            onChange={(e) => onChange("portfolioLink", e.target.value)}
          />
        </div>
      </div>
    </div>

    {/* Video */}
    <div className="doc-link-card">
      <div className="doc-link-header">
        <span className="doc-link-icon">
          <Video size={20} />
        </span>
        <div>
          <div className="doc-link-title">Video Introduction</div>
          <div className="doc-link-desc">
            Short self-introduction video (1 minute maximum), YouTube or Drive
            link
          </div>
        </div>
        <div className="doc-optional">Optional</div>
      </div>
      <div className="field">
        <div className="link-input-wrap">
          <span className="link-icon">
            <Link size={15} />
          </span>
          <input
            type="url"
            placeholder="https://youtube.com/... or Drive link"
            value={state.videoLink}
            onChange={(e) => onChange("videoLink", e.target.value)}
          />
        </div>
      </div>
    </div>
  </div>
);

export default Step5Documents;
