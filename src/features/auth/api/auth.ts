import type { Session } from "@supabase/supabase-js";
import * as authApi from "@/features/auth/api/auth";
import { logout, loginFailure, loginStart, loginSuccess } from "@/features/auth/stores/authSlice";
import { apiPost } from "@/lib/apiClient";
import type { AppDispatch } from "@/store";
import type {
	AuthResponse,
	GoogleLoginPayload,
	LoginPayload,
	SignupPayload,
} from "@/types/auth";

export async function login(
	payload: LoginPayload,
): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/login", payload, {
		withAuth: true,
	});
}

export async function googleLogin(
	payload: GoogleLoginPayload,
): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/google/login", payload, {
		withAuth: true,
	});
}
export async function signup(
	payload: SignupPayload,
): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/signup", payload, {
		withAuth: true,
	});
}

export async function googleSignup(
	payload: GoogleLoginPayload,
): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/google/signup", payload, {
		withAuth: true,
	});
}
export async function logoutApi(payload: {
	refreshToken: string;
}): Promise<AuthResponse> {
	return apiPost<AuthResponse>("/auth/logout", payload, {
		withAuth: true,
	});
}

export const loginUser =
	(payload: LoginPayload) => async (dispatch: AppDispatch) => {
		try {
			dispatch(loginStart());
			const res = await authApi.login(payload);
			const authData = res as AuthResponse;

			dispatch(
				loginSuccess({
					user: authData.data?.user ?? null,
					session: authData.data?.session ?? undefined,
				}),
			);
			return { data: res, error: undefined };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Login failed";
			dispatch(loginFailure(message));
			return { error: err };
		}
	};

export const googleLoginUser =
	(session: Session) => async (dispatch: AppDispatch) => {
		try {
			dispatch(loginStart());
			const payload = {
				token: session.access_token,
				email: session.user?.email!,
				supabaseId: session.user.id,
				name: session.user.user_metadata.full_name,
				picture: session.user.user_metadata.avatar_url,
			};
			const res = await authApi.googleLogin(payload);
			const authData = res as AuthResponse;

			dispatch(
				loginSuccess({
					user: authData?.data ?? null,
					session: session ?? undefined,
				}),
			);

			return { data: res, error: undefined };
		} catch (err: unknown) {
			const message = err instanceof Error ? err.message : "Login failed";
			dispatch(loginFailure(message));
			return { error: err };
		}
	};
export const signupUser =
	(payload: SignupPayload) => async (dispatch: AppDispatch) => {
		try {
			dispatch(loginStart());
			const res = await authApi.signup(payload);
			const authData = res as AuthResponse;

			dispatch(
				loginSuccess({
					user: authData.data?.user ?? null,
					session: authData.data?.session ?? undefined,
				}),
			);
			return {
				data: res,
				error: undefined,
			};
		} catch (err: any) {
			const message =
				err?.response?.data?.error ||
				err?.message ||
				"Signup failed";

			dispatch(loginFailure(message));

			return {
				data: undefined,
				error: message,
			};
		}
	};
export const googleSignupUser =
	(session: {
		access_token: string;
		user: {
			id: string;
			email: string;
			user_metadata: {
				full_name: string;
				avatar_url: string;
			};
		};
	}) =>
		async (dispatch: AppDispatch) => {
			try {
				dispatch(loginStart());

				const payload = {
					email: session.user.email,
					name: session.user.user_metadata.full_name,
					picture: session.user.user_metadata.avatar_url,
					supabaseId: session.user.id,
				};

				const res = await authApi.googleSignup(payload);
				const authData = res as AuthResponse;

				dispatch(
					loginSuccess({
						user: authData.data?.user ?? null,
						session: session ?? undefined,
					}),
				);
			} catch (err: unknown) {
				const message = err instanceof Error ? err.message : "Login failed";

				dispatch(loginFailure(message));
			}
		};

// utils/cookies.ts
export function getCookie(name: string): string | null {
	const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
	return match ? decodeURIComponent(match[2]) : null;
}
// authThunks.ts

export const logoutUser = () => async (dispatch: AppDispatch) => {
	try {
		const refreshToken = getCookie("refreshToken");
		if (!refreshToken) {
			dispatch(loginFailure("Logout failed , No refresh Token"));
			return;
		}

		dispatch(logout());

		document.cookie = "refreshToken=; Path=/; Max-Age=0;";
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Logout failed";
		dispatch(loginFailure(message || "Logout failed"));
	}
};
