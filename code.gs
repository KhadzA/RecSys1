// ── Config ────────────────────────────────────────────────────────────────────
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
// Get from URL: docs.google.com/spreadsheets/d/THIS_PART/edit

// const DRIVE_PARENT_FOLDER_ID = process.env.DRIVE_PARENT_FOLDER_ID;
const DRIVE_PARENT_FOLDER_URL = `https://drive.google.com/drive/folders/${DRIVE_PARENT_FOLDER_ID}`;
// Get from URL: drive.google.com/drive/folders/THIS_PART

var SHEET_NAME = "Applications";
var LOGS_NAME = "Admin Logs";
var JOBS_NAME = "Jobs";

var HEADER_COLOR = "#1a1f35";
var ACCENT_COLOR = "#3ecfdf";
var STATUS_COL = 2;

var STATUS_COLORS = {
  "For Interview": { bg: "#e0f2fe", fg: "#0369a1", tint: "#f0f9ff" },
  Interviewed: { bg: "#d1fae5", fg: "#059669", tint: "#f0fdf6" },
  "For Client Endorsement": { bg: "#ede9fe", fg: "#7c3aed", tint: "#f5f3ff" },
  Hired: { bg: "#dcfce7", fg: "#16a34a", tint: "#f0fdf4" },
  "Hired - Resigned": { bg: "#ffedd5", fg: "#ea580c", tint: "#fff7ed" },
  "Open for other roles": { bg: "#dbeafe", fg: "#2563eb", tint: "#eff6ff" },
  "Could be Revisited": { bg: "#e0f2fe", fg: "#0284c7", tint: "#f0f9ff" },
  "For Future Consideration": { bg: "#f1f5f9", fg: "#475569", tint: "#f8fafc" },
  "No Show": { bg: "#fef9c3", fg: "#a16207", tint: "#fefce8" },
  "Not Qualified": { bg: "#f1f5f9", fg: "#64748b", tint: "#f8fafc" },
  "Duplicate Lead": { bg: "#fae8ff", fg: "#a21caf", tint: "#fdf4ff" },
  Rejected: { bg: "#fee2e2", fg: "#dc2626", tint: "#fff5f5" },
};

var HEADERS = [
  "Timestamp", // col 1  — never synced
  "Status", // col 2  → status
  "Full Name", // col 3  → full_name
  "Email", // col 4  → email
  "Phone", // col 5  → phone
  "Address", // col 6  → address
  "Positions", // col 7  → positions
  "Employment Type", // col 8  → employment_type
  "Work Setup", // col 9  → work_setup
  "Work Schedule", // col 10 → work_schedule
  "Education Level", // col 11 → education_level
  "School", // col 12 → school
  "Course", // col 13 → course
  "Skills", // col 14 → skills
  "Tools", // col 15 → tools
  "Interview Slots", // col 16 → interview_slots
  "Referral Source", // col 17 → referral_source
  "Resume / CV Link", // col 18 → resume_link
  "Portfolio Link", // col 19 → portfolio_link
  "Video Intro Link", // col 20 → video_link
  "Notes", // col 21 → notes
  "Other Docs Link", // col 22 → other_docs_link (certs, diploma, etc.)
  "Drive Folder", // col 23 → drive_folder_link
  "Supabase ID", // col 24 — never synced (used for row matching)
];

var COL_TO_FIELD = {
  2: "status",
  3: "full_name",
  4: "email",
  5: "phone",
  6: "address",
  7: "positions",
  8: "employment_type",
  9: "work_setup",
  10: "work_schedule",
  11: "education_level",
  12: "school",
  13: "course",
  14: "skills",
  15: "tools",
  16: "interview_slots",
  17: "referral_source",
  18: "resume_link",
  19: "portfolio_link",
  20: "video_link",
  21: "notes",
  22: "other_docs_link",
  23: "drive_folder_link",
};

var LOG_HEADERS = ["Timestamp", "Event", "Email", "Info"];
var JOBS_HEADERS = ["Title", "Active", "Date Added"];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getSpreadsheet() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getDriveParentFolder() {
  var parts = DRIVE_PARENT_FOLDER_URL.split("/folders/");
  var folderId = parts[parts.length - 1].split("?")[0];
  try {
    return DriveApp.getFolderById(folderId);
  } catch (e) {
    writeLog("DRIVE_FOLDER_ERROR", "", e.message);
    return DriveApp.getRootFolder();
  }
}

function toBulletLines(items) {
  return items
    .filter(Boolean)
    .map(function (i) {
      return "• " + i.trim();
    })
    .join("\n");
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  );
}

function now() {
  return new Date().toLocaleString("en-PH", { timeZone: "Asia/Manila" });
}

function writeLog(event, email, info) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(LOGS_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(LOGS_NAME);
    setupLogsSheet(sheet);
  }
  sheet.appendRow([now(), event, email || "", info || ""]);
}

function verifyToken(token) {
  return (
    token ===
    PropertiesService.getScriptProperties().getProperty("SESSION_TOKEN")
  );
}

function patchSupabase(supabaseId, fields) {
  var props = PropertiesService.getScriptProperties();
  var supabaseUrl = props.getProperty("SUPABASE_URL");
  var supabaseKey = props.getProperty("SUPABASE_SERVICE_KEY");
  if (!supabaseUrl || !supabaseKey || !supabaseId) return;

  var response = UrlFetchApp.fetch(
    supabaseUrl + "/rest/v1/applications?id=eq." + supabaseId,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: "Bearer " + supabaseKey,
        Prefer: "return=minimal",
      },
      payload: JSON.stringify(fields),
      muteHttpExceptions: true,
    },
  );

  var code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    writeLog(
      "SUPABASE_PATCH_ERROR",
      "",
      "HTTP " + code + ": " + response.getContentText(),
    );
  }
}

// ── Entry point ───────────────────────────────────────────────────────────────
function doPost(e) {
  try {
    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (err) {
      return jsonResponse({ result: "error", message: "Invalid JSON" });
    }

    if (data.type === "INSERT") return handleWebhookInsert(data);
    if (data.type === "UPDATE") return handleWebhookUpdate(data);

    switch (data.action) {
      case "login":
        return handleLogin(data);
      case "getData":
        return handleGetData(data);
      case "submit":
        return handleSubmit(data);
      case "getJobs":
        return handleGetJobs();
      case "addJob":
        return handleAddJob(data);
      case "toggleJob":
        return handleToggleJob(data);
      case "getCounts":
        return handleGetCounts(data);
      case "updateStatus":
        return handleUpdateStatus(data);
      case "search":
        return handleSearch(data);
      default:
        return jsonResponse({
          result: "error",
          message: "Unknown action: " + data.action,
        });
    }
  } catch (err) {
    return jsonResponse({
      result: "error",
      message: "Server error: " + err.message,
    });
  }
}

// ── Supabase webhook — INSERT ─────────────────────────────────────────────────
// Flow: Supabase Storage URLs arrive → download → save to Drive → patch Supabase with Drive URLs → write Sheets
function handleWebhookInsert(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupSheet(sheet);
  }
  if (sheet.getLastRow() === 0) setupSheet(sheet);

  var r = data.record;

  try {
    var result = migrateAllFilesToDrive(
      r.full_name,
      r.resume_link,
      r.other_docs_link,
      r.id,
    );

    var patch = {};
    var changed = false;

    if (result.resumeLink && result.resumeLink !== r.resume_link) {
      patch.resume_link = result.resumeLink;
      r.resume_link = result.resumeLink;
      changed = true;
    }
    if (result.otherDocsLink && result.otherDocsLink !== r.other_docs_link) {
      patch.other_docs_link = result.otherDocsLink;
      r.other_docs_link = result.otherDocsLink;
      changed = true;
    }
    if (result.folderUrl) {
      patch.drive_folder_link = result.folderUrl;
      r.drive_folder_link = result.folderUrl;
      changed = true;
    }

    if (changed) patchSupabase(r.id, patch);
  } catch (err) {
    writeLog("DRIVE_MIGRATE_FAILED", r.email || "", err.message);
  }

  var row = buildRowFromWebhook(r);
  var newRowIndex = sheet.getLastRow() + 1;
  sheet.appendRow(row);
  formatDataRow(sheet, newRowIndex);
  applyStatusColor(sheet, newRowIndex, r.status || "For Interview");
  writeLog("WEBHOOK_INSERT", r.email || "", r.full_name || "");

  return jsonResponse({ result: "success" });
}

// ── Supabase webhook — UPDATE ─────────────────────────────────────────────────
function handleWebhookUpdate(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet)
    return jsonResponse({ result: "error", message: "Sheet not found" });

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return jsonResponse({ result: "error", message: "No rows" });

  var idCol = HEADERS.length;
  var ids = sheet.getRange(2, idCol, lastRow - 1, 1).getValues();
  var targetRow = -1;

  for (var i = 0; i < ids.length; i++) {
    if (ids[i][0] === data.record.id) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1) {
    var row = buildRowFromWebhook(data.record);
    var newRowIndex = sheet.getLastRow() + 1;
    sheet.appendRow(row);
    formatDataRow(sheet, newRowIndex);
    applyStatusColor(sheet, newRowIndex, data.record.status || "For Interview");
    writeLog(
      "WEBHOOK_INSERT_FALLBACK",
      data.record.email || "",
      data.record.full_name || "",
    );
    return jsonResponse({ result: "success", action: "inserted" });
  }

  var r = data.record;
  var updatedRow = buildRowFromWebhook(r);
  for (var col = 2; col <= HEADERS.length - 1; col++) {
    sheet.getRange(targetRow, col).setValue(updatedRow[col - 1]);
  }

  applyStatusColor(sheet, targetRow, r.status);
  writeLog("WEBHOOK_UPDATE", r.email || "", r.full_name + " → " + r.status);

  return jsonResponse({ result: "success", action: "updated" });
}

// ── Migrate Supabase Storage → Google Drive ───────────────────────────────────
// Called on INSERT webhook. Downloads all files, saves to named folder in Drive.
// Returns { resumeLink, otherDocsLink, folderUrl } with Drive URLs.
function migrateAllFilesToDrive(
  fullName,
  resumeLink,
  otherDocsLink,
  supabaseId,
) {
  var hasResume = resumeLink && resumeLink.trim();
  var hasOther = otherDocsLink && otherDocsLink.trim();

  if (!hasResume && !hasOther) {
    return {
      resumeLink: resumeLink,
      otherDocsLink: otherDocsLink,
      folderUrl: "",
    };
  }

  var parent = getDriveParentFolder();
  var folderName = (fullName || "Applicant").trim();

  // Reuse folder if it already exists (protects against webhook retries)
  var existing = parent.getFoldersByName(folderName);
  var folder = existing.hasNext()
    ? existing.next()
    : parent.createFolder(folderName);

  try {
    folder.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW,
    );
  } catch (e) {
    writeLog("DRIVE_SHARING_WARN", "", "Folder: " + e.message);
  }

  var folderUrl = "https://drive.google.com/drive/folders/" + folder.getId();

  return {
    resumeLink: hasResume
      ? migrateLinksToFolder(resumeLink, folder)
      : resumeLink,
    otherDocsLink: hasOther
      ? migrateLinksToFolder(otherDocsLink, folder)
      : otherDocsLink,
    folderUrl: folderUrl,
  };
}

// Downloads a newline-separated list of URLs and saves to Drive folder.
// Uses Supabase anon key for Supabase Storage URLs.
// Returns newline-separated Drive URLs (originals kept on failure).
function migrateLinksToFolder(linkStr, folder) {
  var props = PropertiesService.getScriptProperties();
  var anonKey = props.getProperty("SUPABASE_ANON_KEY");

  var links = linkStr.split("\n").filter(Boolean);
  var driveLinks = [];

  links.forEach(function (url) {
    url = url.trim();
    if (!url) return;

    // Already a Drive link — keep as-is
    if (url.indexOf("drive.google.com") !== -1) {
      driveLinks.push(url);
      return;
    }

    try {
      writeLog("DRIVE_MIGRATE_FETCHING", "", url);

      var fetchOptions = { muteHttpExceptions: true, followRedirects: true };
      if (url.indexOf("supabase.co") !== -1 && anonKey) {
        fetchOptions.headers = {
          apikey: anonKey,
          Authorization: "Bearer " + anonKey,
        };
      }

      var response = UrlFetchApp.fetch(url, fetchOptions);
      var code = response.getResponseCode();
      writeLog("DRIVE_MIGRATE_FETCH_CODE", "", "HTTP " + code);

      if (code !== 200) {
        driveLinks.push(url);
        return;
      }

      var blob = response.getBlob();
      var segments = url.split("?")[0].split("/");
      var fileName =
        decodeURIComponent(segments[segments.length - 1]) || "file";
      blob.setName(fileName);

      var file = folder.createFile(blob);
      try {
        file.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW,
        );
      } catch (e) {
        writeLog("DRIVE_SHARING_WARN", "", "File: " + e.message);
      }

      var driveUrl =
        "https://drive.google.com/file/d/" + file.getId() + "/view";
      driveLinks.push(driveUrl);
      writeLog("DRIVE_MIGRATE_OK", "", fileName + " → " + driveUrl);
    } catch (err) {
      driveLinks.push(url);
      writeLog("DRIVE_MIGRATE_ERROR", "", url + ": " + err.message);
    }
  });

  return driveLinks.join("\n");
}

// ── Build row from Supabase webhook payload ───────────────────────────────────
function buildRowFromWebhook(r) {
  return [
    r.created_at || now(),
    r.status || "For Interview",
    r.full_name || "",
    r.email || "",
    r.phone || "",
    r.address || "",
    r.positions || "",
    r.employment_type || "",
    r.work_setup || "",
    r.work_schedule || "",
    r.education_level || "",
    r.school || "",
    r.course || "",
    r.skills || "",
    r.tools || "",
    r.interview_slots || "",
    r.referral_source
      ? r.referral_code
        ? r.referral_source.replace(
            "Referral",
            "Referral [" + r.referral_code + "]",
          )
        : r.referral_source
      : "",
    r.resume_link || "", // col 18
    r.portfolio_link || "", // col 19
    r.video_link || "", // col 20
    r.notes || "", // col 21
    r.other_docs_link || "", // col 22
    r.drive_folder_link || "", // col 23
    r.id || "", // col 24
  ];
}

// ── Login ─────────────────────────────────────────────────────────────────────
function handleLogin(data) {
  var props = PropertiesService.getScriptProperties();
  var validEmail = props.getProperty("ADMIN_EMAIL");
  var validPassword = props.getProperty("ADMIN_PASSWORD");
  var token = props.getProperty("SESSION_TOKEN");

  if (data.email === validEmail && data.password === validPassword) {
    writeLog("LOGIN_SUCCESS", data.email, "Credentials matched");
    return jsonResponse({ result: "success", token: token });
  }
  writeLog("LOGIN_FAILED", data.email, "Wrong credentials");
  return jsonResponse({ result: "error", message: "Invalid credentials" });
}

// ── Get applications ──────────────────────────────────────────────────────────
function handleGetData(data) {
  if (!verifyToken(data.token)) {
    writeLog("UNAUTHORIZED_ACCESS", "", "getData");
    return jsonResponse({ result: "error", message: "Unauthorized" });
  }

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2)
    return jsonResponse({ result: "success", data: [], total: 0 });

  var rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length)
    .getValues();
  var all = rows
    .map(function (row) {
      return {
        timestamp: row[0],
        status: row[1],
        fullName: row[2],
        email: row[3],
        phone: row[4],
        address: row[5],
        positions: row[6],
        employmentType: row[7],
        workSetup: row[8],
        workSchedule: row[9],
        educationLevel: row[10],
        school: row[11],
        course: row[12],
        skills: row[13],
        tools: row[14],
        interviewSlots: row[15],
        referralSource: row[16],
        resumeLink: row[17],
        portfolioLink: row[18],
        videoLink: row[19],
        notes: row[20],
        otherDocsLink: row[21],
        driveFolderLink: row[22],
        supabaseId: row[23],
      };
    })
    .filter(function (r) {
      return r.fullName || r.email;
    });

  if (data.status && data.status !== "All") {
    all = all.filter(function (r) {
      return r.status === data.status;
    });
  }
  all = all.reverse();

  var total = all.length;
  var limit = data.limit || 10;
  var page = data.page || 1;
  var start = (page - 1) * limit;

  return jsonResponse({
    result: "success",
    data: all.slice(start, start + limit),
    total: total,
  });
}

// ── Get status counts ─────────────────────────────────────────────────────────
function handleGetCounts(data) {
  if (!verifyToken(data.token))
    return jsonResponse({ result: "error", message: "Unauthorized" });

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  var counts = { total: 0 };
  Object.keys(STATUS_COLORS).forEach(function (s) {
    counts[s] = 0;
  });

  if (!sheet || sheet.getLastRow() < 2)
    return jsonResponse({ result: "success", counts: counts });

  sheet
    .getRange(2, STATUS_COL, sheet.getLastRow() - 1, 1)
    .getValues()
    .forEach(function (row) {
      var s = row[0];
      if (counts[s] !== undefined) counts[s]++;
      counts.total++;
    });

  return jsonResponse({ result: "success", counts: counts });
}

// ── Update application status ─────────────────────────────────────────────────
function handleUpdateStatus(data) {
  if (!verifyToken(data.token))
    return jsonResponse({ result: "error", message: "Unauthorized" });

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet)
    return jsonResponse({ result: "error", message: "Sheet not found" });

  var rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, 4).getValues();
  var targetRow = -1;

  for (var i = 0; i < rows.length; i++) {
    if (rows[i][3] === data.email && rows[i][2] === data.fullName) {
      targetRow = i + 2;
      break;
    }
  }

  if (targetRow === -1)
    return jsonResponse({ result: "error", message: "Applicant not found" });

  sheet.getRange(targetRow, STATUS_COL).setValue(data.status);
  applyStatusColor(sheet, targetRow, data.status);
  writeLog("STATUS_UPDATED", data.email, data.fullName + " → " + data.status);

  return jsonResponse({ result: "success" });
}

// ── Search ────────────────────────────────────────────────────────────────────
function handleSearch(data) {
  if (!verifyToken(data.token))
    return jsonResponse({ result: "error", message: "Unauthorized" });

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2)
    return jsonResponse({ result: "success", data: [] });

  var query = (data.query || "").toLowerCase().trim();
  if (!query) return jsonResponse({ result: "success", data: [] });

  var results = [];
  sheet
    .getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length)
    .getValues()
    .forEach(function (row) {
      if (
        [row[2], row[3], row[6], row[1]]
          .join(" ")
          .toLowerCase()
          .indexOf(query) !== -1
      ) {
        results.push({
          timestamp: row[0],
          status: row[1],
          fullName: row[2],
          email: row[3],
          phone: row[4],
          address: row[5],
          positions: row[6],
          employmentType: row[7],
          workSetup: row[8],
          workSchedule: row[9],
          educationLevel: row[10],
          school: row[11],
          course: row[12],
          skills: row[13],
          tools: row[14],
          interviewSlots: row[15],
          referralSource: row[16],
          resumeLink: row[17],
          portfolioLink: row[18],
          videoLink: row[19],
          notes: row[20],
          otherDocsLink: row[21],
          driveFolderLink: row[22],
          supabaseId: row[23],
        });
      }
    });

  return jsonResponse({ result: "success", data: results.reverse() });
}

// ── Submit (legacy fallback) ──────────────────────────────────────────────────
function handleSubmit(data) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) setupSheet(sheet);

  if (data.files && data.files.length > 0) {
    var links = saveFilesToDrive(data.firstName, data.lastName, data.files);
    data.resumeLink = links.resumeLink;
    if (links.videoLink) data.videoLink = links.videoLink;
  }

  var row = buildRow(data);
  var newRowIndex = sheet.getLastRow() + 1;
  sheet.appendRow(row);
  formatDataRow(sheet, newRowIndex);
  applyStatusColor(sheet, newRowIndex, row[STATUS_COL - 1]);
  writeLog(
    "APPLICATION_SUBMITTED",
    data.email || "",
    (data.firstName || "") + " " + (data.lastName || ""),
  );

  return jsonResponse({ result: "success" });
}

function saveFilesToDrive(firstName, lastName, files) {
  var parent = getDriveParentFolder();
  var folderName =
    [firstName, lastName].filter(Boolean).join(" ") ||
    "Applicant_" + Date.now();
  var folder = parent.createFolder(folderName);

  try {
    folder.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW,
    );
  } catch (e) {
    writeLog("DRIVE_SHARING_WARN", "", e.message);
  }

  var resumeLinks = [];
  var videoLink = "";

  files.forEach(function (file) {
    try {
      var blob = Utilities.newBlob(
        Utilities.base64Decode(file.data),
        file.mimeType || "application/octet-stream",
        file.name,
      );
      var saved = folder.createFile(blob);
      try {
        saved.setSharing(
          DriveApp.Access.ANYONE_WITH_LINK,
          DriveApp.Permission.VIEW,
        );
      } catch (e) {
        writeLog("DRIVE_SHARING_WARN", "", e.message);
      }

      var fileUrl =
        "https://drive.google.com/file/d/" + saved.getId() + "/view";
      if (file.mimeType && file.mimeType.indexOf("video/") === 0)
        videoLink = fileUrl;
      else resumeLinks.push(fileUrl);
    } catch (e) {
      writeLog("FILE_UPLOAD_ERROR", "", file.name + ": " + e.message);
    }
  });

  return { resumeLink: resumeLinks.join("\n"), videoLink: videoLink };
}

// ── Jobs ──────────────────────────────────────────────────────────────────────
function handleGetJobs() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(JOBS_NAME);
  if (!sheet || sheet.getLastRow() < 2)
    return jsonResponse({ result: "success", data: [] });

  var jobs = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 3)
    .getValues()
    .map(function (row, i) {
      return {
        index: i + 2,
        title: row[0],
        active: row[1] === true || row[1] === "TRUE" || row[1] === "Active",
      };
    })
    .filter(function (j) {
      return j.title;
    });

  return jsonResponse({ result: "success", data: jobs });
}

function handleAddJob(data) {
  if (!verifyToken(data.token))
    return jsonResponse({ result: "error", message: "Unauthorized" });
  if (!data.title || !data.title.trim())
    return jsonResponse({ result: "error", message: "Title is required" });

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(JOBS_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(JOBS_NAME);
    setupJobsSheet(sheet);
  }

  sheet.appendRow([data.title.trim(), true, now()]);
  writeLog("JOB_ADDED", "", data.title.trim());
  return jsonResponse({ result: "success" });
}

function handleToggleJob(data) {
  if (!verifyToken(data.token))
    return jsonResponse({ result: "error", message: "Unauthorized" });

  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(JOBS_NAME);
  if (!sheet)
    return jsonResponse({ result: "error", message: "Jobs sheet not found" });

  var current = sheet.getRange(data.index, 2).getValue();
  sheet
    .getRange(data.index, 2)
    .setValue(
      !(current === true || current === "TRUE" || current === "Active"),
    );
  return jsonResponse({ result: "success" });
}

// ── Build row (legacy) ────────────────────────────────────────────────────────
function buildRow(d) {
  var fullName =
    [d.firstName, d.lastName].filter(Boolean).join(" ") || d.fullName || "";
  var positions = toBulletLines([d.position1, d.position2, d.position3]);
  var skills = d.skillsList ? toBulletLines(d.skillsList.split(",")) : "";

  var scheduleList = d.workSchedule
    ? d.workSchedule
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean)
    : [];
  var workSchedule =
    scheduleList.length >= 4 || scheduleList.includes("Flexible")
      ? "Flexible"
      : toBulletLines(scheduleList);

  var referralParts = d.referralSource
    ? d.referralSource.split(",").map(function (s) {
        return s.trim();
      })
    : [];
  var referralDisplay = toBulletLines(
    referralParts.map(function (s) {
      return s === "Referral" && d.referralCode && d.referralCode.trim()
        ? "Referral [" + d.referralCode.trim() + "]"
        : s;
    }),
  );

  return [
    now(),
    "For Interview",
    fullName,
    d.email || "",
    d.phone || "",
    d.address || "",
    positions,
    d.employmentType || "",
    d.workSetup ? toBulletLines(d.workSetup.split(",")) : "",
    workSchedule,
    d.educationLevel || "",
    d.school || "",
    d.course || "",
    skills,
    toBulletLines(
      [].concat(
        d.tools ? d.tools.split(",") : [],
        d.otherTools ? d.otherTools.split(",") : [],
      ),
    ),
    toBulletLines([
      d.slot1Date && d.slot1Time
        ? d.slot1Date + " @ " + d.slot1Time
        : d.slot1Date || "",
      d.slot2Date && d.slot2Time
        ? d.slot2Date + " @ " + d.slot2Time
        : d.slot2Date || "",
      d.slot3Date && d.slot3Time
        ? d.slot3Date + " @ " + d.slot3Time
        : d.slot3Date || "",
    ]),
    referralDisplay,
    d.resumeLink || "",
    d.portfolioLink || "",
    d.videoLink || "",
    d.notes || "",
    d.otherDocsLink || "",
    d.driveFolderLink || "",
    d.supabaseId || "",
  ];
}

// ── onSheetEdit — sync cell changes → Supabase ────────────────────────────────
// MUST be an INSTALLABLE TRIGGER (not simple trigger)
// Setup: Apps Script → Triggers → Add Trigger
//   Function: onSheetEdit | From spreadsheet | On edit → Save
function onSheetEdit(e) {
  var sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  var col = e.range.getColumn();
  var row = e.range.getRow();
  if (row < 2) return;

  if (col === STATUS_COL) applyStatusColor(sheet, row, e.range.getValue());

  var field = COL_TO_FIELD[col];
  if (!field) return;

  var newValue = e.range.getValue();

  // Prevent sync loop — webhook writes have no oldValue
  if (e.oldValue === undefined) return;
  if (String(newValue) === String(e.oldValue)) return;

  var supabaseId = sheet.getRange(row, HEADERS.length).getValue();
  if (!supabaseId) return;

  try {
    var payload = {};
    payload[field] = newValue || null;
    patchSupabase(supabaseId, payload);
    writeLog(
      "SHEETS_SYNC",
      "",
      "Row " + row + " [" + field + "] → " + newValue,
    );
  } catch (err) {
    writeLog("SHEETS_SYNC_ERROR", "", err.message);
  }
}

// ── Sheet setup ───────────────────────────────────────────────────────────────
function setupSheet(sheet) {
  sheet.appendRow(HEADERS);
  var headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
  headerRange
    .setBackground(HEADER_COLOR)
    .setFontColor("#ffffff")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setRowHeightForcefully(1, 40);
  headerRange.setBorder(
    false,
    false,
    true,
    false,
    false,
    false,
    ACCENT_COLOR,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM,
  );
  [
    220, 150, 220, 280, 180, 300, 440, 200, 200, 260, 220, 260, 260, 380, 380,
    360, 240, 340, 320, 320, 320, 340, 260, 200,
  ].forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
  addStatusDropdown(sheet, 2, 1000);
}

function setupLogsSheet(sheet) {
  sheet.appendRow(LOG_HEADERS);
  var range = sheet.getRange(1, 1, 1, LOG_HEADERS.length);
  range
    .setBackground("#0f172a")
    .setFontColor("#ffffff")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeightForcefully(1, 36);
  range.setBorder(
    false,
    false,
    true,
    false,
    false,
    false,
    ACCENT_COLOR,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM,
  );
  [200, 180, 240, 280].forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
}

function setupJobsSheet(sheet) {
  sheet.appendRow(JOBS_HEADERS);
  var range = sheet.getRange(1, 1, 1, JOBS_HEADERS.length);
  range
    .setBackground(HEADER_COLOR)
    .setFontColor("#ffffff")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle");
  sheet.setFrozenRows(1);
  sheet.setRowHeightForcefully(1, 36);
  range.setBorder(
    false,
    false,
    true,
    false,
    false,
    false,
    ACCENT_COLOR,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM,
  );
  [300, 100, 200].forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
}

function addStatusDropdown(sheet, fromRow, toRow) {
  var ss = getSpreadsheet();
  var helper =
    ss.getSheetByName("_StatusList") || ss.insertSheet("_StatusList");
  helper.hideSheet();
  Object.keys(STATUS_COLORS).forEach(function (s, i) {
    helper.getRange(i + 1, 1).setValue(s);
  });
  var range = helper.getRange(1, 1, Object.keys(STATUS_COLORS).length, 1);
  var rule = SpreadsheetApp.newDataValidation()
    .requireValueInRange(range, true)
    .setAllowInvalid(false)
    .build();
  sheet
    .getRange(fromRow, STATUS_COL, toRow - fromRow + 1, 1)
    .setDataValidation(rule);
}

function formatDataRow(sheet, rowIndex) {
  var range = sheet.getRange(rowIndex, 1, 1, HEADERS.length);
  var isEven = rowIndex % 2 === 0;
  range
    .setBackground(isEven ? "#f0f4ff" : "#ffffff")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontColor("#1e293b")
    .setVerticalAlignment("middle")
    .setHorizontalAlignment("left")
    .setWrap(false);
  sheet.setRowHeight(rowIndex, 21);
  sheet.getRange(rowIndex, 5).setHorizontalAlignment("center");
  sheet.getRange(rowIndex, 6).setWrap(true);
  sheet.getRange(rowIndex, 18).setWrap(true);
  range.setBorder(
    false,
    false,
    true,
    false,
    false,
    false,
    "#e2e8f0",
    SpreadsheetApp.BorderStyle.SOLID,
  );
  addStatusDropdown(sheet, rowIndex, rowIndex);
}

function applyStatusColor(sheet, rowIndex, statusValue) {
  var colors = STATUS_COLORS[statusValue] || {
    bg: "#f1f5f9",
    fg: "#64748b",
    tint: "#f8fafc",
  };
  sheet.getRange(rowIndex, 1, 1, HEADERS.length).setBackground(colors.tint);
  sheet
    .getRange(rowIndex, STATUS_COL)
    .setBackground(colors.bg)
    .setFontColor(colors.fg)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setBorder(
      true,
      true,
      true,
      true,
      false,
      false,
      colors.fg + "55",
      SpreadsheetApp.BorderStyle.SOLID,
    );
}

// ── One-time utilities ────────────────────────────────────────────────────────
function fixHeaderRow() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn());
  range
    .setBackground(HEADER_COLOR)
    .setFontColor("#ffffff")
    .setFontFamily("Arial")
    .setFontSize(10)
    .setFontWeight("bold")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);
  sheet.setRowHeightForcefully(1, 40);
  sheet.setFrozenRows(1);
  range.setBorder(
    false,
    false,
    true,
    false,
    false,
    false,
    ACCENT_COLOR,
    SpreadsheetApp.BorderStyle.SOLID_MEDIUM,
  );
  SpreadsheetApp.getUi().alert("Header row fixed.");
}

function resizeColumns() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  [
    220, 150, 220, 280, 180, 300, 440, 200, 200, 260, 220, 260, 260, 380, 380,
    360, 240, 340, 320, 320, 320, 340, 260, 200,
  ].forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
  SpreadsheetApp.getUi().alert("Column widths updated.");
}

function reformatExistingSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME) || ss.getActiveSheet();
  var last = sheet.getLastRow();
  if (last < 2) return;
  for (var r = 2; r <= last; r++) {
    formatDataRow(sheet, r);
    var status = sheet.getRange(r, STATUS_COL).getValue();
    if (status) applyStatusColor(sheet, r, status);
  }
}

function migrateStatuses() {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;

  var renames = { "Hired|Resigned": "Resigned", Pending: "For Interview" };
  sheet
    .getRange(2, STATUS_COL, sheet.getLastRow() - 1, 1)
    .getValues()
    .forEach(function (row, i) {
      if (renames[row[0]]) {
        var rowIndex = i + 2;
        sheet.getRange(rowIndex, STATUS_COL).setValue(renames[row[0]]);
        applyStatusColor(sheet, rowIndex, renames[row[0]]);
      }
    });
  SpreadsheetApp.getUi().alert("Migration complete.");
}

function authorizeDrive() {
  var folder = DriveApp.getRootFolder();
  Logger.log("Drive authorized: " + folder.getName());
}

function createApplicationsSheet() {
  var ss = getSpreadsheet();
  var sheet = ss.insertSheet(SHEET_NAME);
  setupSheet(sheet);
  SpreadsheetApp.getUi().alert("Applications sheet created!");
}
