import React from "react";

const LABELS = ["Personal", "Position", "Experience", "Schedule", "Documents"];

interface StepsBarProps {
  current: number; // 1-based
}

const StepsBar: React.FC<StepsBarProps> = ({ current }) => (
  <div className="steps">
    {LABELS.map((label, i) => {
      const n = i + 1;
      const isActive = n === current;
      const isDone = n < current;
      return (
        <div
          key={n}
          className={`step${isActive ? " active" : ""}${isDone ? " completed" : ""}`}
        >
          <div className="step-circle">{isDone ? "✓" : n}</div>
          <div className="step-label">{label}</div>
        </div>
      );
    })}
  </div>
);

export default StepsBar;
