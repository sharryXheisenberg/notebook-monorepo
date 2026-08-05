import { getAuthToken } from "@/lib/auth/cookies";
import { ApiError, type ApiErrorResponse } from "@/types/api-error";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api/v1";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  auth?: boolean; // defaults to true — set false for public endpoints (share, register, login)
}

/**
 * Thin typed fetch wrapper. Every call goes through here so auth header attachment and
 * error-shape parsing happen in exactly one place, matching docs/API.md's error contract.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (auth) {
    const token = getAuthToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorBody: ApiErrorResponse;
    try {
      errorBody = await response.json();
    } catch {
      errorBody = { error: "unknown_error", message: response.statusText };
    }
    throw new ApiError(response.status, errorBody);
  }

  // Some endpoints (forgot-password, reset-password) return 200 with an empty body by
  // design — e.g. forgot-password never reveals whether the email exists, so there's
  // nothing to send back. Reading as text first and only parsing if non-empty handles
  // both that case and the explicit 204 case below, instead of assuming every non-204
  // response has a JSON body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
}

/**
 * For endpoints that return a file (export), not JSON.
 */
export async function apiRequestBlob(path: string): Promise<Blob> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  if (!response.ok) {
    throw new ApiError(response.status, { error: "export_failed" });
  }
  return response.blob();
}