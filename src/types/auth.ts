import type { AuthResponse as SupabaseAuthResponse } from "@supabase/supabase-js";
import type { ViewMode } from "./type";

export type AuthResponse = SupabaseAuthResponse & {
	userTeam?: unknown;
	userProject?: unknown;
};

export interface AuthState {
	user: { id?: string; email?: string; user_metadata?: { full_name?: string } } | null;
	token: string | null;
	isAuthenticated: boolean;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	refreshToken?: string;
	viewMode?: ViewMode;
}

export interface LoginPayload {
	email: string;
	password: string;
}

export interface GoogleLoginPayload {
	email: string;
	name: string;
	picture: string;
	supabaseId: string;
}

export interface SignupPayload {
	email: string;
	username: string;
	password: string;
}