// Vite env type declaration for TypeScript

declare global {
  interface ImportMetaEnv {
    VITE_API_URL?: string;
    [key: string]: any;
  }
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function api<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<T>;
} 