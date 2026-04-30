/*
  Central backend helper file.

  Instead of typing http://localhost:3001 everywhere,
  pages can use these helper functions.
*/

const API_BASE_URL = "http://localhost:3001";

export function getToken() {
  return localStorage.getItem("token");
}

export function getMemberId() {
  return localStorage.getItem("member_id");
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "Backend request failed.");
  }

  return data;
}