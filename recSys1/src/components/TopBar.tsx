import React from "react";
import { Sun, Moon } from "lucide-react";
import LogoDark from "../assets/Logo-NavBar.svg";
import LogoWhite from "../assets/Logo-NavBar-White.svg";

interface TopBarProps {
  dark: boolean;
  onToggleDark: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ dark, onToggleDark }) => (
  <div
    className="top-bar"
    style={{
      padding: "14px 32px",
      display: "flex",
      alignItems: "center",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}
  >
    <img
      src={dark ? LogoWhite : LogoDark}
      alt="Upstaff"
      style={{ height: "2.2rem", width: "auto", display: "block" }}
    />
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <button className="dm-toggle" onClick={onToggleDark}>
        <span className="dm-icon">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </span>
        <span>{dark ? "Light" : "Dark"}</span>
      </button>
    </div>
  </div>
);

export default TopBar;
