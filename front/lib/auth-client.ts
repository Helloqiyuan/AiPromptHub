/** 浏览器本地存储的 token 键名（与业务无关的固定前缀，避免与其它站点冲突） */
export const AUTH_TOKEN_KEY = "ai_prompt_hub_token";

/** 登录用户展示名（与 token 同步写入/清除） */
export const AUTH_USERNAME_KEY = "ai_prompt_hub_username";

/** 同页监听登录态变化（登出/登录写入 localStorage 后派发） */
export const AUTH_CHANGE_EVENT = "ai-prompt-hub-auth-change";

function broadcastAuthChange() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setStoredToken(token: string): void {
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  broadcastAuthChange();
}

export function getStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_USERNAME_KEY);
}

export function setStoredUsername(username: string): void {
  window.localStorage.setItem(AUTH_USERNAME_KEY, username);
}

export function clearStoredToken(): void {
  window.localStorage.removeItem(AUTH_TOKEN_KEY);
  window.localStorage.removeItem(AUTH_USERNAME_KEY);
  broadcastAuthChange();
}
