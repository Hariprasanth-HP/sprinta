import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthState } from "@/types/auth";
import { ViewMode } from "@/types/type";
import type { User } from "@supabase/supabase-js";

const initialState: AuthState = {
	user: JSON.parse(localStorage.getItem("user") || "null"),
	token: localStorage.getItem("access_token"),
	isAuthenticated: !!localStorage.getItem("access_token"),
	status: "idle",
	error: null,
	viewMode: localStorage.getItem("view")
		? JSON.parse(localStorage.getItem("view")! ?? null)
		: ViewMode.LIST,
};

interface SetAuthPayload {
	token: string | null;
	user?: User | null;
}

interface LoginSuccessPayload {
	user?: unknown;
	session?: { access_token?: string };
	refreshToken?: string;
}

const authSlice = createSlice({
	name: "auth",
	initialState,
	reducers: {
		setAuth(state, action: PayloadAction<SetAuthPayload>) {
			state.token = action.payload.token ?? null;
			state.user = action.payload.user ?? null;
			state.isAuthenticated = !!action.payload.token;
			if (action.payload.token)
				localStorage.setItem("access_token", action.payload.token);
			else {
				localStorage.removeItem("access_token");
				localStorage.removeItem("user");
			}
			if (action.payload.user)
				localStorage.setItem("user", JSON.stringify(action.payload.user));
		},
		loginStart(state) {
			state.status = "loading";
			state.error = null;
		},
		loginSuccess(state, action: PayloadAction<LoginSuccessPayload>) {
			state.status = "succeeded";
			const user = (action.payload.user ?? null) as User | null;
			state.user = user;
			const token = action.payload.session?.access_token ?? null;
			state.token = token;
			state.isAuthenticated = true;
			if (token) localStorage.setItem("access_token", token);
			if (user) localStorage.setItem("user", JSON.stringify(user));

			if (action.payload.session?.access_token)
				document.cookie = `refreshToken=${action.payload.session?.access_token}; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
		},
		setViewMode(state, action: PayloadAction<ViewMode>) {
			state.viewMode = action.payload;
			localStorage.setItem("view", JSON.stringify(action.payload));
		},
		loginFailure(state, action: PayloadAction<string>) {
			state.status = "failed";
			state.error = action.payload;
		},
		logout(state) {
			state.user = null;
			state.token = null;
			state.isAuthenticated = false;
			state.status = "idle";
			state.error = null;
			localStorage.removeItem("access_token");
			localStorage.removeItem("user");
		},
	},
});

export const {
	loginStart,
	loginSuccess,
	loginFailure,
	logout,
	setAuth,
	setViewMode,
} = authSlice.actions;
export default authSlice.reducer;