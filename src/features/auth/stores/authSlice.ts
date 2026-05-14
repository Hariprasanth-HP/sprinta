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
	userTeam: JSON.parse(localStorage.getItem("team") || "null"),
	userProject: JSON.parse(localStorage.getItem("project") || "null"),
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
	userTeam?: AuthState["userTeam"];
	userProject?: AuthState["userProject"];
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
			console.log('action.payloadaction.payload', action.payload);

			const user = (action.payload.user ?? null) as AuthState["user"];
			state.user = user;
			const token = action.payload.session?.access_token ?? null;
			state.token = token;
			state.isAuthenticated = true;
			state.userTeam = (action.payload.userTeam ?? null) as AuthState["userTeam"];
			state.userProject = (action.payload.userProject ?? null) as AuthState["userProject"];
			if (token) localStorage.setItem("access_token", token);
			if (user) localStorage.setItem("user", JSON.stringify(user));

			if (action.payload.refreshToken)
				document.cookie = `refreshToken=${action.payload.refreshToken}; Path=/; Max-Age=${60 * 60 * 24 * 7}`;
		},
		setTeam(state, action: PayloadAction<{ userTeam?: AuthState["userTeam"] }>) {
			const team = action.payload.userTeam;
			state.userTeam = team ?? null;
			state.userProject = null;
			localStorage.setItem("team", JSON.stringify(team));
			localStorage.removeItem("project");
		},
		setProject(
			state,
			action: PayloadAction<{ userProject?: AuthState["userProject"] }>,
		) {
			const project = action.payload.userProject;
			state.userProject = project ?? null;
			localStorage.setItem("project", JSON.stringify(project));
		},
		setViewMode(state, action: PayloadAction<ViewMode>) {
			state.viewMode = action.payload;
			localStorage.setItem("view", JSON.stringify(action.payload));
		},
		clearTeamAndProject(state) {
			state.userProject = null;
			state.userTeam = null;
			localStorage.removeItem("team");
			localStorage.removeItem("project");
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
			localStorage.removeItem("team");
			localStorage.removeItem("project");
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
	setTeam,
	setProject,
	clearTeamAndProject,
	setViewMode,
} = authSlice.actions;
export default authSlice.reducer;