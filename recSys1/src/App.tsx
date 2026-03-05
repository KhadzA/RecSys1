import React, { useState } from "react";
import TopBar from "./components/TopBar";
import StepsBar from "./components/StepsBar";
import SuccessScreen from "./components/SuccessScreen";
import Step1Personal from "./components/steps/Step1Personal";
import Step2Position from "./components/steps/Step2Position";
import Step3Experience from "./components/steps/Step3Experience";
import Step4Schedule from "./components/steps/Step4Schedule";
import Step5Documents from "./components/steps/Step5Documents";
import { initialFormState } from "./types/form";
import type { FormState } from "./types/form";
import { submitApplication } from "./utils/submit";
import "./styles/apply.css";

// Set to false before going live
const DEV_MODE = true;

const TOTAL_STEPS = 5;

type ArrayFields = "workSetup" | "workSchedule" | "tools" | "referralSource";

function App() {
  const [dark, setDark] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<
    Partial<Record<keyof FormState, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [done, setDone] = useState(false);

  const onChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onToggleArray = (field: ArrayFields, value: string) => {
    setForm((prev) => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const onSetSkills = (skills: string[]) =>
    setForm((prev) => ({ ...prev, skills }));

  const validate = (s: number): boolean => {
    if (DEV_MODE) return true;
    const errs: Partial<Record<keyof FormState, string>> = {};

    if (s === 1) {
      if (!form.firstName.trim()) errs.firstName = "First name is required";
      if (!form.lastName.trim()) errs.lastName = "Last name is required";
      if (!form.email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
        errs.email = "Enter a valid email address";
      if (!form.phone.trim()) errs.phone = "Phone number is required";
      if (!form.address.trim()) errs.address = "Address is required";
    }
    if (s === 2) {
      if (!form.position1)
        errs.position1 = "Please select your 1st choice position";
    }
    if (s === 4) {
      if (!form.slot1Date) errs.slot1Date = "Please pick a date for Slot 1";
      if (!form.slot1Time) errs.slot1Time = "Please pick a time for Slot 1";
    }
    if (s === 5) {
      if (!form.resumeLink.trim())
        errs.resumeLink = "Resume / CV link is required";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = async () => {
    if (!validate(step)) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setSubmitting(true);
      try {
        const ref = await submitApplication(form);
        setRefNo(ref);
        setDone(true);
      } catch {
        alert(
          "Something went wrong. Please check your connection and try again.",
        );
      } finally {
        setSubmitting(false);
      }
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={dark ? "dark" : ""} style={{ minHeight: "100vh" }}>
      <div className="glow" />
      <div className="glow2" />
      <TopBar dark={dark} onToggleDark={() => setDark(!dark)} />

      <div className="wrapper">
        {done ? (
          <SuccessScreen refNo={refNo} />
        ) : (
          <>
            <div className="page-title">
              Upstaff <span>Application</span> Form
            </div>
            <div className="page-sub">
              Fill out the form below to apply. Takes about 5–10 minutes.
            </div>

            <StepsBar current={step} />

            <div className="form-card">
              {step === 1 && (
                <Step1Personal
                  state={form}
                  errors={errors}
                  onChange={onChange}
                />
              )}
              {step === 2 && (
                <Step2Position
                  state={form}
                  errors={errors}
                  onChange={onChange}
                  onToggleArray={onToggleArray}
                />
              )}
              {step === 3 && (
                <Step3Experience
                  state={form}
                  onChange={onChange}
                  onToggleArray={
                    onToggleArray as (field: "tools", value: string) => void
                  }
                  onSetSkills={onSetSkills}
                />
              )}
              {step === 4 && (
                <Step4Schedule
                  state={form}
                  errors={errors}
                  onChange={onChange}
                  onToggleArray={
                    onToggleArray as (
                      field: "referralSource",
                      value: string,
                    ) => void
                  }
                />
              )}
              {step === 5 && (
                <Step5Documents
                  state={form}
                  errors={errors}
                  onChange={onChange}
                />
              )}

              <div className="form-nav">
                <button
                  className="btn btn-ghost"
                  onClick={prevStep}
                  style={{ visibility: step === 1 ? "hidden" : "visible" }}
                >
                  ← Back
                </button>
                <span className="progress-text">
                  Step {step} of {TOTAL_STEPS}
                </span>
                <button
                  className="btn btn-primary"
                  onClick={nextStep}
                  disabled={submitting}
                >
                  {submitting
                    ? "Submitting…"
                    : step === TOTAL_STEPS
                      ? "Submit Application"
                      : "Continue →"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
