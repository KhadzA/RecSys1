import type { FormState, FormPayload } from "../types/form";

const SHEET_URL = import.meta.env.VITE_SHEET_URL as string;

interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64
}

async function fileToBase64(file: File): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      resolve({
        name: file.name,
        mimeType: file.type || "application/octet-stream", // fallback
        data: base64,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function submitApplication(
  state: FormState,
  uploadedFiles: { resumeFiles: File[]; videoFile: File | null },
): Promise<void> {
  console.log("submit started", uploadedFiles);

  const files: UploadedFile[] = [];

  try {
    for (const f of uploadedFiles.resumeFiles) {
      console.log("converting file:", f.name, f.size, f.type);
      files.push(await fileToBase64(f));
      console.log("converted:", f.name);
    }
  } catch (err) {
    console.error("file conversion failed:", err);
    throw err;
  }

  console.log("files ready, building payload. total files:", files.length);

  const payload: FormPayload & { action: string; files: UploadedFile[] } = {
    action: "submit",
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
    resumeLink: "",
    portfolioLink: state.portfolioLink,
    videoLink: state.videoLink,
    files,
  };

  const bodyStr = JSON.stringify(payload);
  console.log("payload size (bytes):", bodyStr.length);

  await fetch(SHEET_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain" },
    body: bodyStr,
  });

  console.log("fetch fired");
}
