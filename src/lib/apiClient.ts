// src/lib/apiClient.ts

import { setAuth } from "@/features/auth/stores/authSlice";
import { store } from "../store";
import { supabase } from "./supabase";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Internal refresh queue to avoid race conditions
let refreshingPromise: Promise<boolean> | null = null;

/**
 * Call /api/auth/refresh to get a new access token using the refresh cookie.
 * On success dispatches setAuth({ token, user }) and returns true.
 * On failure clears auth and returns false.
 */
async function refreshAccessToken(): Promise<boolean> {
	if (refreshingPromise) return refreshingPromise;

	refreshingPromise = (async () => {
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.refreshSession();

			if (error || !session) {
				console.error("Supabase refresh failed:", error);

				store.dispatch(
					setAuth({
						token: null,
						user: null,
					}),
				);

				return false;
			}

			store.dispatch(
				setAuth({
					token: session.access_token,
					user: session.user,
				}),
			);

			return true;
		} catch (err) {
			console.error("refreshAccessToken error", err);

			store.dispatch(
				setAuth({
					token: null,
					user: null,
				}),
			);

			return false;
		} finally {
			refreshingPromise = null;
		}
	})();

	return refreshingPromise;
}

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

async function apiRequest<T = unknown>(
	path: string,
	method: Method = "GET",
	body?: unknown,
	opts?: { retry?: boolean; withAuth?: boolean; isFormData?: boolean },
): Promise<T> {
	const { retry = true, withAuth = true, isFormData = false } = opts ?? {};

	const token = store.getState().auth?.token;
	const headers: Record<string, string> = {};

	if (!isFormData) {
		headers["Content-Type"] = "application/json";
	}

	if (withAuth && token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers,
		body: (isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined) as BodyInit | null | undefined,
		credentials: "include", // send cookies (refresh token cookie is HttpOnly)
	});

	// If request is unauthorized and retry is allowed, try refresh flow
	if (
		res.status === 401 &&
		retry &&
		!path?.includes("login") &&
		!path?.includes("signup") &&
		!path?.includes("logout")
	) {
		const refreshed = await refreshAccessToken();
		if (refreshed) {
			// retry original request once with new token
			const newToken = store.getState().auth?.token;
			const retryHeaders = { ...headers };
			if (withAuth && newToken)
				retryHeaders["Authorization"] = `Bearer ${newToken}`;

			const retryRes = await fetch(`${API_BASE}${path}`, {
				method,
				headers: retryHeaders,
				body: (isFormData ? body : body !== undefined ? JSON.stringify(body) : undefined) as BodyInit | null | undefined,
				credentials: "include",
			});

			if (!retryRes.ok) {
				const errBody = await safeParse(retryRes);
				throw new ApiError(
					retryRes.status,
					errBody?.error ?? errBody?.message ?? "Request failed after refresh",
				);
			}
			const parsed = await safeParse(retryRes);
			return parsed as T;
		} else {
			// refresh failed -> throw so app can redirect to login
			throw new ApiError(401, "Authentication required");
		}
	}

	if (!res.ok) {
		const errBody = await safeParse(res);
		throw new ApiError(
			res.status,
			errBody?.error ?? errBody?.message ?? "Request failed",
		);
	}

	return (await safeParse(res)) as T;
}

async function safeParse(res: Response) {
	try {
		return await res.json();
	} catch {
		return null;
	}
}

class ApiError extends Error {
	status: number;
	constructor(status: number, message?: string) {
		super(message ?? "API Error");
		this.status = status;
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

/* Convenience wrappers */
export async function apiGet<T = unknown>(
	path: string,
	opts?: { withAuth?: boolean },
) {
	return apiRequest<T>(path, "GET", undefined, {
		withAuth: opts?.withAuth ?? true,
	});
}
export async function apiPost<T = unknown>(
	path: string,
	body?: unknown,
	opts?: { withAuth?: boolean; isFormData?: boolean },
) {
	return apiRequest<T>(path, "POST", body, {
		withAuth: opts?.withAuth ?? true,
		isFormData: opts?.isFormData ?? false,
	});
}

export async function apiPatch<T = unknown>(
	path: string,
	body?: unknown,
	opts?: { withAuth?: boolean },
) {
	return apiRequest<T>(path, "PATCH", body, {
		withAuth: opts?.withAuth ?? true,
	});
}
export async function apiPut<T = unknown>(
	path: string,
	body?: unknown,
	opts?: { withAuth?: boolean },
) {
	return apiRequest<T>(path, "PUT", body, { withAuth: opts?.withAuth ?? true });
}
export async function apiDelete<T = unknown>(
	path: string,
	opts?: { withAuth?: boolean },
) {
	return apiRequest<T>(path, "DELETE", undefined, {
		withAuth: opts?.withAuth ?? true,
	});
}

/* Export error type so callers can inspect status */
export { ApiError };
