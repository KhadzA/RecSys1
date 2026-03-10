import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, MoveLeft } from "lucide-react";
import TopBar from "../components/TopBar";
import { loginAdmin } from "../utils/auth";
import "/src/styles/apply.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dark, setDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in both email and password.");
      return;
    }
    setIsLoading(true);
    try {
      await loginAdmin(email, password);
      navigate("/pages/admin/dashboard");
    } catch {
      alert("Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="glow" />
      <div className="glow2" />

      <TopBar dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="wrapper" style={{ maxWidth: 480 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            color: "var(--muted)",
            textDecoration: "none",
            marginBottom: 28,
            opacity: 0.7,
            transition: "opacity 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        >
          <MoveLeft />
          Back to Home
        </Link>

        <div className="page-title" style={{ marginBottom: 6 }}>
          Recruiter <span>Login</span>
        </div>
        <div className="page-sub" style={{ marginBottom: 32 }}>
          Enter credentials to access your Recruiter account.
        </div>

        <div className="form-card">
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="field" style={{ marginBottom: 20 }}>
              <label>
                Email Address <span className="req">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={16}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field" style={{ marginBottom: 32 }}>
              <label>
                Password <span className="req">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <Lock
                  size={16}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                    opacity: 0.5,
                    pointerEvents: "none",
                  }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: 40, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 13,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    opacity: 0.5,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="form-nav" style={{ marginTop: 0 }}>
              <span />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
                style={{ width: "100%" }}
              >
                {isLoading ? "Logging in…" : "Login →"}
              </button>
            </div>
          </form>

          <div className="divider" />
        </div>
      </div>
    </div>
  );
}

export default Login;
