import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import "./LandingPage.css";
import LogoDark from "./assets/Logo-NavBar.svg";
import LogoWhite from "./assets/Logo-NavBar-White.svg";
import { getDarkMode, setDarkMode } from "./utils/darkmode";

export default function LandingPage() {
  const navigate = useNavigate();
  const [dark, setDark] = useState(() => getDarkMode());

  useEffect(() => {
    setDarkMode(dark);
  }, [dark]);

  return (
    <div className="landing-root">
      <div className="landing-glow landing-glow-1" />
      <div className="landing-glow landing-glow-2" />
      <div className="landing-grid" />

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <img
            src={dark ? LogoWhite : LogoDark}
            alt="Upstaff"
            className="landing-logo"
          />
          <div className="landing-nav-actions">
            {/* Dark mode toggle */}
            <button
              className="landing-btn-ghost landing-dm-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle dark mode"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{dark ? "Light" : "Dark"}</span>
            </button>

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
