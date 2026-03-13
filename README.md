# upstaff — Recruitment System

A full-stack job application and admin management system built with React + Google Apps Script.

**Live site:** https://rec-sys1.vercel.app/

---

## Overview

Upstaff is a recruitment pipeline tool with two sides:

- **Applicant-facing form** — a multi-step application form where candidates fill in their details, preferred positions, availability, and upload their resume/CV.
- **Admin dashboard** — a protected dashboard for reviewing applications, updating statuses, and managing job listings.

All data is stored in **Google Sheets**, with files saved to **Google Drive**.

---

## Tech Stack

| Layer        | Technology                                       |
| ------------ | ------------------------------------------------ |
| Frontend     | React + TypeScript + Vite                        |
| Styling      | Plain CSS with CSS variables (dark mode support) |
| Backend      | Google Apps Script (Web App)                     |
| Database     | Google Sheets                                    |
| File Storage | Google Drive                                     |
| Hosting      | Vercel                                           |

---

## Project Structure

```
src/
├── assets/                  # SVG logos
├── components/
│   ├── AdminLayout.tsx       # Sidebar + topbar shell for admin pages
│   ├── AdminLayout.css
│   ├── StatusDropdown.tsx    # Inline status picker component
│   └── TopBar.tsx            # Top navigation bar with dark mode toggle
├── pages/
│   ├── apply/
│   │   └── ApplyForm.tsx     # Main multi-step application form
│   ├── admin/
│   │   └── Dashboard.tsx     # Admin dashboard
│   └── admin/
│       └── Jobs.tsx          # Job listing manager
├── steps/
│   ├── Step1Personal.tsx     # Name, email, phone, address
│   ├── Step2Position.tsx     # Job positions, employment type, work setup
│   ├── Step3Skills.tsx       # Skills, tools, education
│   ├── Step4Schedule.tsx     # Interview slots, referral source
│   └── Step5Documents.tsx    # Resume upload, portfolio link, video link
├── styles/
│   └── apply.css             # Global styles + dark mode variables
├── types/
│   └── form.ts               # FormState, FormPayload TypeScript types
└── utils/
    ├── auth.ts               # All API calls (login, fetch, search, update)
    ├── statuses.ts           # Centralized status list + colors ← edit here
    └── submit.ts             # Form submission with base64 file encoding

Code.gs                       # Google Apps Script backend (single file)
```

---

## Features

### Application Form

- 5-step guided form with validation at each step
- Fetches active job listings dynamically from the sheet
- Portfolio link required for Graphic Designer positions
- Resume/CV file upload (multiple files, max 15MB each)
- Video introduction link (YouTube or Drive)
- Referral code support — shows code input when "Referral" is selected
- Files uploaded to Google Drive under a `FirstName_LastName` subfolder
- Each file gets a direct shareable Drive link stored in the sheet

### Admin Dashboard

- Protected by email + password login with session token
- Application cards with expandable details
- Inline status update via `StatusDropdown` — updates the sheet in real time
- Status tabs for filtering (All / per-status)
- Count overview cards per status
- Server-side search across all applications
- Pagination (10 per page)
- Refresh button
- Dark mode support

### Google Sheets Integration

- Each application is a row in the `Applications` sheet
- Entire row is color-tinted based on status
- Status cell gets stronger color + border
- `onEdit` trigger re-colors rows when status is changed directly in the sheet
- Status dropdown in the sheet uses a hidden `_StatusList` helper sheet (no character limit issues)
- Admin Logs sheet tracks all events (submissions, logins, status changes)

### Jobs Management

- Jobs sheet controls which positions appear in the application form
- Admin can add new jobs and toggle them active/inactive from the dashboard

---

## Centralized Status Configuration

Statuses are defined in **two places** — keep them in sync:

### Frontend — `src/utils/statuses.ts`

```typescript
export const STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  "For Interview": { bg: "#e0f2fe", color: "#0369a1" },
  Interviewed: { bg: "#d1fae5", color: "#059669" },
  "For Client Endorsement": { bg: "#ede9fe", color: "#7c3aed" },
  Hired: { bg: "#dcfce7", color: "#16a34a" },
  Resigned: { bg: "#ffedd5", color: "#ea580c" },
  "Open for other roles": { bg: "#dbeafe", color: "#2563eb" },
  "Could be Revisited": { bg: "#e0f2fe", color: "#0284c7" },
  "For Future Consideration": { bg: "#f1f5f9", color: "#475569" },
  "No Show": { bg: "#fef9c3", color: "#a16207" },
  "Not Qualified": { bg: "#f1f5f9", color: "#64748b" },
  "Duplicate Lead": { bg: "#fae8ff", color: "#a21caf" },
  Rejected: { bg: "#fee2e2", color: "#dc2626" },
};
```

### Backend — `Code.gs` → `STATUS_COLORS`

```javascript
var STATUS_COLORS = {
  "For Interview": { bg: "#e0f2fe", fg: "#0369a1", tint: "#f0f9ff" },
  // ... same statuses with tint added for row background
};
```

> `bg` = cell/badge background, `fg`/`color` = text color, `tint` = full row background tint

---

## Google Apps Script Setup

### Script Properties (set via Project Settings → Script Properties)

| Key               | Value                                             |
| ----------------- | ------------------------------------------------- |
| `ADMIN_EMAIL`     | Admin login email                                 |
| `ADMIN_PASSWORD`  | Admin login password                              |
| `SESSION_TOKEN`   | Any long random string used as auth token         |
| `DRIVE_FOLDER_ID` | Google Drive folder ID for applicant file uploads |

### Deployment

1. Open [script.google.com](https://script.google.com)
2. Paste `Code.gs` content
3. **Deploy → New deployment → Web App**
4. Execute as: **Me** | Who has access: **Anyone**
5. Copy the deployment URL into your `.env`:

```env
VITE_SHEET_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

> ⚠️ Every time you change `Code.gs`, you must create a **new version** in Manage Deployments — otherwise the old code keeps running.

### First-time Drive Authorization

Run this function once in the Apps Script editor to authorize Drive access:

```javascript
function testDrive() {
  DriveApp.getRootFolder(); // triggers auth prompt
}
```

Then delete it after authorizing.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_SHEET_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## Local Development

```bash
npm install
npm run dev
```

> ⚠️ Auth calls (login, fetch applications) require CORS and **only work from the deployed Vercel URL**, not localhost. The application submission (no-cors) works locally.

---

## Deployment (Vercel)

The project includes a `vercel.json` for SPA routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Push to your connected GitHub repo — Vercel auto-deploys on every push.

---

## One-time Utility Functions

These functions exist in `Code.gs` and can be run manually from the Apps Script editor:

| Function                  | Purpose                                                                       |
| ------------------------- | ----------------------------------------------------------------------------- |
| `fixHeaderRow()`          | Re-styles the header row                                                      |
| `resizeColumns()`         | Resets all column widths                                                      |
| `reformatExistingSheet()` | Re-applies row formatting + status colors to all rows                         |
| `migrateStatuses()`       | Renames old status values to new ones (edit the `renames` map before running) |

---

## Known Constraints

- Google Apps Script has a **30-second execution timeout** — avoid uploading large files
- Base64 encoding inflates file size by ~33% — keep resume files under 10MB
- Apps Script **50MB POST limit** total per request
- The sheet status dropdown uses `requireValueInRange` (not `requireValueInList`) to avoid the 256-character combined list limit
- Auth calls use standard `fetch` with CORS — they only work from the deployed domain, not localhost
- Application submissions use `no-cors` mode — the response cannot be read, so errors are silent on the frontend; check **Apps Script → Executions** for server-side errors
