import React from "react";

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
      position: "relative",
      zIndex: 10,
    }}
  >
    <img
      src="/upstaff-logo.svg"
      alt="UpStaff logo"
      style={{ height: "2.5rem", width: "auto", display: "block" }}
      onError={(e) =>
        ((e.currentTarget as HTMLImageElement).style.display = "none")
      }
    />
    <span
      style={{
        fontFamily: '"Google Sans Flex", sans-serif',
        fontWeight: 800,
        fontSize: 26,
        letterSpacing: -0.3,
        color: "#ffffff",
        marginLeft: 10,
      }}
    >
      Upstaff
    </span>
    <div
      style={{
        marginLeft: "auto",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <button className="dm-toggle" onClick={onToggleDark}>
        <span className="dm-icon">{dark ? "☀️" : "🌙"}</span>
        <span>{dark ? "Light" : "Dark"}</span>
      </button>
    </div>
  </div>
);

export default TopBar;
