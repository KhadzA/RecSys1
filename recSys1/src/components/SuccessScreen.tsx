import React from "react";

interface SuccessScreenProps {
  refNo: string;
}

const SuccessScreen: React.FC<SuccessScreenProps> = ({ refNo }) => (
  <div className="success-screen show">
    <div className="form-card" style={{ textAlign: "center" }}>
      <div className="success-icon">✓</div>
      <div className="success-title">Application Submitted!</div>
      <div className="success-sub">
        Thank you for applying to UpStaff.
        <br />
        Our HR team will review your application and confirm your interview
        schedule within 2–3 business days.
      </div>
      <div className="ref-badge">
        Reference No: <strong>{refNo}</strong>
      </div>
    </div>
  </div>
);

export default SuccessScreen;
