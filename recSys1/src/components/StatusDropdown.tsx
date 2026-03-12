import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface StatusDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  statusStyles: Record<string, { bg: string; color: string }>;
  statusOptions: string[];
}

export default function StatusDropdown({
  value,
  onChange,
  disabled = false,
  statusStyles,
  statusOptions,
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const currentStyle = statusStyles[value];

  // Close dropdown when clicking outside
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
      style={{
        position: "relative",
        display: "inline-block",
      }}
    >
      {/* Trigger Button */}
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
          minWidth: 110,
          justifyContent: "space-between",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            (e.target as HTMLButtonElement).style.boxShadow =
              `0 0 0 3px ${currentStyle.color}15`;
          }
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.boxShadow = "none";
        }}
      >
        {value}
        <ChevronDown
          size={16}
          style={{
            transition: "transform 0.2s ease",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 8,
            backgroundColor: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            zIndex: 1000,
            minWidth: 140,
            overflow: "hidden",
          }}
        >
          {statusOptions.map((status) => {
            const style = statusStyles[status];
            const isSelected = status === value;

            return (
              <button
                key={status}
                onClick={() => handleSelect(status)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  textAlign: "left",
                  backgroundColor: isSelected ? style.bg : "transparent",
                  color: style.color,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "inherit",
                  transition: "all 0.15s ease",
                  borderLeft: isSelected
                    ? `3px solid ${style.color}`
                    : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      `${style.bg}`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    (e.target as HTMLButtonElement).style.backgroundColor =
                      "transparent";
                  }
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
