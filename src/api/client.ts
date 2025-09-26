// Generic GET request helper
export async function apiGet<T>(path: string, params?: Record<string, string>) {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  const res = await fetch(`/api/${path}${qs}`);
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: "An unknown error occurred" }));
    console.error(`[API ERROR] GET /api/${path}${qs}:`, errorBody.error);
    throw new Error(errorBody.error || "Server error");
  }
  return res.json() as Promise<T>;
}

// Generic POST request helper
export async function apiPost<T>(path: string, body: any) {
  const res = await fetch(`/api/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ error: "An unknown error occurred" }));
    console.error(`[API ERROR] POST /api/${path}:`, errorBody.error);
    throw new Error(errorBody.error || "Server error");
  }
  return res.json() as Promise<T>;
}
