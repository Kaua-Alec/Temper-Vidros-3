const KEY = "temper_vidros_sf_user";

export function getUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(KEY) || "";
}

export function setUserName(name: string) {
  localStorage.setItem(KEY, name.trim());
  window.dispatchEvent(new Event("temper_vidros_sf_user_change"));
}

export function clearUserName() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("temper_vidros_sf_user_change"));
}
