const KEY = "upstaff_dark";

export function getDarkMode(): boolean {
  return localStorage.getItem(KEY) === "true";
}

export function setDarkMode(dark: boolean): void {
  localStorage.setItem(KEY, String(dark));
  document.documentElement.classList.toggle("dark", dark);
}
