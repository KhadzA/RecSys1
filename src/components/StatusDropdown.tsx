import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { STATUS_STYLES, STATUS_LIST } from "../utils/statuses";

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function StatusDropdown({
  value,
  onChange,
  disabled = false,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentStyle = STATUS_STYLES[value] ?? {
    bg: "#f1f5f9",
    color: "#64748b",
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (status: string) => {
    onChange(status);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      style={{ position: "relative", display: "inline-block" }}
    >
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 24,
          background: currentStyle.bg,
          color: currentStyle.color,
          border: `1.5px solid ${currentStyle.color}60`,
          cursor: disabled ? "not-allowed" : "pointer",
          fontSize: 12,
          fontWeight: 700,
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.2s ease",
          minWidth: 160,
          width: 200,
          justifyContent: "center",
          fontFamily: "inherit",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={(e) => {
          if (!disabled)
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              `0 0 0 3px ${currentStyle.color}20`;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        {value || "Set status"}
        <ChevronDown
          size={14}
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            flexShrink: 0,
          }}
        />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 1000,
            minWidth: 220,
            overflow: "hidden",
          }}
        >
          {STATUS_LIST.map((status) => {
            const style = STATUS_STYLES[status];
            const isSelected = status === value;
            return (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                style={{
                  width: "100%",
                  padding: "9px 14px",
                  textAlign: "left",
                  backgroundColor: isSelected ? style.bg : "transparent",
                  color: style.color,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  transition: "background 0.15s ease",
                  borderLeft: isSelected
                    ? `3px solid ${style.color}`
                    : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = style.bg;
                }}
                onMouseLeave={(e) => {
                  if (!isSelected)
                    (
                      e.currentTarget as HTMLButtonElement
                    ).style.backgroundColor = "transparent";
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: style.color,
                    opacity: isSelected ? 1 : 0.5,
                    flexShrink: 0,
                  }}
                />
                {status}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
