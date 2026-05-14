import type { AuthResponse as SupabaseAuthResponse, User } from "@supabase/supabase-js";
import type { Project, Team, ViewMode } from "./type";

export type AuthResponse = SupabaseAuthResponse & {
	userTeam?: Team | null;
	userProject?: Project | null;
};

export interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	status: "idle" | "loading" | "succeeded" | "failed";
	error: string | null;
	userProject: Project | undefined | null;
	userTeam: Team | undefined | null;
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