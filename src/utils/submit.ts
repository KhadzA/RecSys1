import { supabase } from "./supabase";
import type { FormState } from "../types/form";

async function uploadFile(file: File, folder: string): Promise<string> {
  const path = `${folder}/${file.name}`;

  const { error } = await supabase.storage
    .from("applicant-files")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("applicant-files").getPublicUrl(path);
  return data.publicUrl;
}

export async function submitApplication(
  state: FormState,
  uploadedFiles: {
    resumeFiles: File[];
    otherDocFiles: File[];
  },
): Promise<void> {
  const folder = `${state.firstName}_${state.lastName}_${Date.now()}`;

  const resumeUrls: string[] = [];
  for (const file of uploadedFiles.resumeFiles) {
    resumeUrls.push(await uploadFile(file, folder));
  }

  const otherDocUrls: string[] = [];
  for (const file of uploadedFiles.otherDocFiles) {
    otherDocUrls.push(await uploadFile(file, folder));
  }

  const positions = [state.position1, state.position2, state.position3]
    .filter(Boolean)
    .map((p) => `• ${p}`)
    .join("\n");

  const { error } = await supabase.from("applications").insert({
    status: "For Interview",
    first_name: state.firstName,
    last_name: state.lastName,
    full_name: `${state.firstName} ${state.lastName}`.trim(),
    email: state.email,
    phone: state.phone,
    address: state.address,
    positions,
    employment_type: state.employmentType,
    work_setup: state.workSetup.join(", "),
    work_schedule: state.workSchedule.join(", "),
    education_level: state.educationLevel,
    school: state.school,
    course: state.course,
    skills: state.skills.join(", "),
    tools: [...state.tools, state.otherTools].filter(Boolean).join(", "),
    interview_slots: [
      state.slot1Date && state.slot1Time
        ? `${state.slot1Date} @ ${state.slot1Time}`
        : state.slot1Date,
      state.slot2Date && state.slot2Time
        ? `${state.slot2Date} @ ${state.slot2Time}`
        : state.slot2Date,
      state.slot3Date && state.slot3Time
        ? `${state.slot3Date} @ ${state.slot3Time}`
        : state.slot3Date,
    ]
      .filter(Boolean)
      .map((s) => `• ${s}`)
      .join("\n"),
    referral_source: state.referralSource.join(", "),
    referral_code: state.referralCode || null,
    resume_link: resumeUrls.join("\n"),
    other_docs_link: otherDocUrls.length > 0 ? otherDocUrls.join("\n") : null,
    portfolio_link: state.portfolioLink || null,
    video_link: state.videoLink || null,
    // drive_folder_link is set by Apps Script after migrating files to Drive
  });

  if (error) throw new Error(`Submission failed: ${error.message}`);
}
