import React from "react";

const SuccessScreen: React.FC = () => (
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
    </div>
  </div>
);

export default SuccessScreen;
