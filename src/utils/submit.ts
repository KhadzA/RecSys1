import { supabase } from "./supabase";
import type { FormState } from "../types/form";

async function uploadFile(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("applicant-files")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from("applicant-files").getPublicUrl(path);

  return data.publicUrl;
}

export async function submitApplication(
  state: FormState,
  uploadedFiles: { resumeFiles: File[]; videoFile: File | null },
): Promise<void> {
  const folder = `${state.firstName}_${state.lastName}_${Date.now()}`;

  // Upload resume files
  const resumeUrls: string[] = [];
  for (const file of uploadedFiles.resumeFiles) {
    const url = await uploadFile(file, folder);
    resumeUrls.push(url);
  }

  // Upload video if file was provided
  let videoLink = state.videoLink || "";
  if (uploadedFiles.videoFile) {
    videoLink = await uploadFile(uploadedFiles.videoFile, folder);
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
    portfolio_link: state.portfolioLink || null,
    video_link: videoLink || null,
  });

  if (error) throw new Error(`Submission failed: ${error.message}`);
}
