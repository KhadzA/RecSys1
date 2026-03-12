import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const SuccessScreen: React.FC = () => (
  <div className="success-screen show">
    <div
      className="form-card"
      style={{ textAlign: "center", padding: "48px 32px" }}
    >
      <div className="success-icon">✓</div>
      <div className="success-title">Application Submitted!</div>
      <div className="success-sub">
        Thank you for applying to UpStaff!
        <br />
        Our HR team will review your application and confirm your interview
        schedule within 2–3 business days.
      </div>
      <Link
        to="/"
        className="btn btn-primary"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginTop: 28,
          textDecoration: "none",
        }}
      >
        <Home size={16} />
        Back to Home
      </Link>
    </div>
  </div>
);

export default SuccessScreen;
