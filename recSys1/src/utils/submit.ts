import type { FormState, FormPayload } from "../types/form";

const SHEET_URL = import.meta.env.VITE_SHEET_URL as string;

export async function submitApplication(state: FormState): Promise<void> {
  const payload: FormPayload = {
    firstName: state.firstName,
    lastName: state.lastName,
    email: state.email,
    phone: state.phone,
    address: state.address,
    position1: state.position1,
    position2: state.position2,
    position3: state.position3,
    employmentType: state.employmentType,
    workSetup: state.workSetup.join(", "),
    workSchedule: state.workSchedule.join(", "),
    educationLevel: state.educationLevel,
    school: state.school,
    course: state.course,
    skillsList: state.skills.join(", "),
    tools: state.tools.join(", "),
    otherTools: state.otherTools,
    slot1Date: state.slot1Date,
    slot1Time: state.slot1Time,
    slot2Date: state.slot2Date,
    slot2Time: state.slot2Time,
    slot3Date: state.slot3Date,
    slot3Time: state.slot3Time,
    referralSource: state.referralSource.join(", "),
    referralCode: state.referralCode,
    resumeLink: state.resumeLink,
    portfolioLink: state.portfolioLink,
    videoLink: state.videoLink,
  };

  // await fetch(SHEET_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(payload),
  // });

  //

  await fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors", // fire-and-forget, no preflight
    headers: { "Content-Type": "text/plain" }, // consistent with login
    body: JSON.stringify({ action: "submit", ...payload }),
  });
}
