interface Props {
  current: number;
  onStepClick?: (step: number) => void;
}

const STEPS = ["Personal", "Position", "Experience", "Schedule", "Documents"];

export default function StepsBar({ current, onStepClick }: Props) {
  return (
    <div className="steps">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isCompleted = stepNum < current;
        const isClickable = isCompleted && !!onStepClick;

        return (
          <div
            key={stepNum}
            className={`step ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
          >
            <div
              className="step-circle"
              onClick={() => isClickable && onStepClick(stepNum)}
              title={isCompleted ? `Go back to ${label}` : undefined}
              style={{
                cursor: isClickable ? "pointer" : "default",
                outline: "none",
              }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
              onKeyDown={(e) => {
                if (isClickable && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onStepClick(stepNum);
                }
              }}
            >
              {isCompleted ? "✓" : stepNum}
            </div>
            <div className="step-label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}
