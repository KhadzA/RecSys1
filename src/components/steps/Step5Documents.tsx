import React, { useRef } from "react";
import {
  FolderOpen,
  ImageIcon,
  Video,
  Link,
  Upload,
  X,
  FileText,
} from "lucide-react";
import type { FormState } from "../../types/form";

interface UploadedFiles {
  resumeFiles: File[];
  videoFile: File | null;
}

interface Props {
  state: FormState;
  errors: Partial<Record<keyof FormState, string>>;
  onChange: (field: keyof FormState, value: string) => void;
  uploadedFiles: UploadedFiles;
  onUploadedFilesChange: (files: UploadedFiles) => void;
  fileErrors: { resumeFiles?: string; videoFile?: string };
}

const DESIGNER_POSITIONS = ["Graphic Designer"];
const MAX_FILE_MB = 15;

const formatBytes = (bytes: number) =>
  bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

const Step5Documents: React.FC<Props> = ({
  state,
  errors,
  onChange,
  uploadedFiles,
  onUploadedFilesChange,
  fileErrors,
}) => {
  const resumeInputRef = useRef<HTMLInputElement>(null);

  const isDesigner = DESIGNER_POSITIONS.some((p) =>
    [state.position1, state.position2, state.position3].includes(p),
  );

  const handleResumeFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => f.size <= MAX_FILE_MB * 1024 * 1024);
    onUploadedFilesChange({ ...uploadedFiles, resumeFiles: valid });
    e.target.value = "";
  };

  const removeResumeFile = (index: number) => {
    const next = uploadedFiles.resumeFiles.filter((_, i) => i !== index);
    onUploadedFilesChange({ ...uploadedFiles, resumeFiles: next });
  };

  return (
    <div className="step-section active">
      <div className="section-heading">Documents & Links</div>
      <div className="section-sub">
        Upload your files directly — they'll be saved to a private folder in our
        Google Drive.
      </div>

      {/* Resume / Certs */}
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
              Upload your resume and any certificates. Max {MAX_FILE_MB}MB per
              file. PDF preferred.
            </div>
          </div>
        </div>

        {/* Naming guide */}
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
            📌 Name your files before uploading:
          </strong>
          <br />
          &nbsp;&nbsp;•{" "}
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
          &nbsp;&nbsp;•{" "}
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
          &nbsp;&nbsp;•{" "}
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

        {/* Uploaded file list */}
        {uploadedFiles.resumeFiles.length > 0 && (
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            {uploadedFiles.resumeFiles.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: "rgba(62,207,223,0.07)",
                  border: "1px solid rgba(62,207,223,0.2)",
                  borderRadius: 8,
                  padding: "7px 11px",
                  fontSize: 13,
                }}
              >
                <FileText
                  size={14}
                  style={{ color: "var(--accent)", flexShrink: 0 }}
                />
                <span
                  style={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {f.name}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "var(--muted)",
                    flexShrink: 0,
                  }}
                >
                  {formatBytes(f.size)}
                </span>
                <button
                  type="button"
                  onClick={() => removeResumeFile(i)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    padding: 2,
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <input
          ref={resumeInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={handleResumeFiles}
        />
        <button
          type="button"
          className={`btn btn-ghost${fileErrors.resumeFiles ? " input-error" : ""}`}
          onClick={() => resumeInputRef.current?.click()}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            fontSize: 13,
          }}
        >
          <Upload size={15} />
          {uploadedFiles.resumeFiles.length > 0
            ? "Add More Files"
            : "Choose Files"}
        </button>
        {fileErrors.resumeFiles && (
          <div className="field-error">{fileErrors.resumeFiles}</div>
        )}
      </div>

      {/* Portfolio */}
      <div className="doc-link-card">
        <div className="doc-link-header">
          <span className="doc-link-icon">
            <ImageIcon size={20} />
          </span>
          <div>
            <div className="doc-link-title">
              Portfolio / Work Samples{" "}
              {isDesigner && (
                <span style={{ color: "var(--error)", fontSize: 12 }}>*</span>
              )}
            </div>
            <div className="doc-link-desc">
              Link to your portfolio, Behance, GitHub, or sample work folder
              {isDesigner && (
                <span
                  style={{
                    display: "inline-block",
                    marginLeft: 6,
                    fontSize: 11.5,
                    color: "var(--error)",
                    background: "rgba(217,53,53,0.07)",
                    padding: "1px 7px",
                    borderRadius: 6,
                    fontWeight: 600,
                  }}
                >
                  Required for Graphic Designer
                </span>
              )}
            </div>
          </div>
          {!isDesigner && <div className="doc-optional">Optional</div>}
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
              className={errors.portfolioLink ? "input-error" : ""}
            />
          </div>
          {errors.portfolioLink && (
            <div className="field-error">{errors.portfolioLink}</div>
          )}
        </div>
      </div>

      {/* Video */}

      {/* Uploaded video badge */}
      <div className="doc-link-card">
        <div className="doc-link-header">
          <span className="doc-link-icon">
            <Video size={20} />
          </span>
          <div>
            <div className="doc-link-title">Video Introduction</div>
            <div className="doc-link-desc">
              Upload your video to YouTube or Google Drive, then paste the link
              here. Short self-introduction (1 min max).
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
};

export default Step5Documents;
