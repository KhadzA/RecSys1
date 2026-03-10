import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-root">
      {/* Ambient background */}
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />
      <div className="landing-grid" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <img
            src="src/assets/Logo-NavBar.svg"
            alt="Upstaff"
            className="landing-logo"
          />
          <div className="landing-nav-actions">
            <button
              className="landing-btn-ghost"
              onClick={() => navigate("/auth/login")}
            >
              Login
            </button>
            <button
              className="landing-btn-primary"
              onClick={() => navigate("/pages/applicant/applyForm")}
            >
              Apply Now
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-eyebrow">Opportunities await</div>
          <h1 className="landing-headline">
            Find your next
            <br />
            <span className="landing-headline-accent">great role.</span>
          </h1>
          <p className="landing-sub">
            Upstaff connects talented professionals with the companies that need
            them most.
          </p>
          <div className="landing-cta-group">
            <button
              className="landing-btn-primary landing-btn-lg"
              onClick={() => navigate("/pages/applicant/applyForm")}
            >
              Apply Now →
            </button>
            <button
              className="landing-btn-ghost landing-btn-lg"
              onClick={() => navigate("/auth/login")}
            >
              Login to Portal
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
