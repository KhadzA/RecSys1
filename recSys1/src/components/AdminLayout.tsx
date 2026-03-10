import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Briefcase, LogOut, Menu, X } from "lucide-react";
import TopBar from "../components/TopBar";
import { logout } from "../utils/auth";
import "/src/styles/apply.css";
import "./AdminLayout.css";

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const navItems = [
    {
      to: "/pages/admin/dashboard",
      icon: <LayoutDashboard size={18} />,
      label: "Dashboard",
    },
    {
      to: "/pages/admin/jobs",
      icon: <Briefcase size={18} />,
      label: "Add Jobs",
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="glow" />
      <div className="glow2" />
      <TopBar dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="admin-body">
        {/* Side nav */}
        <aside className={`admin-sidenav ${collapsed ? "collapsed" : ""}`}>
          <button
            className="sidenav-toggle"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : "Collapse"}
          >
            {collapsed ? <Menu size={16} /> : <X size={16} />}
          </button>

          <nav className="sidenav-links">
            {navItems.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `sidenav-link ${isActive ? "active" : ""}`
                }
              >
                <span className="sidenav-icon">{icon}</span>
                {!collapsed && <span className="sidenav-label">{label}</span>}
              </NavLink>
            ))}
          </nav>

          <button className="sidenav-logout" onClick={handleLogout}>
            <span className="sidenav-icon">
              <LogOut size={18} />
            </span>
            {!collapsed && <span className="sidenav-label">Logout</span>}
          </button>
        </aside>

        {/* Main content */}
        <main className="admin-main">{children}</main>
      </div>
    </div>
  );
}
