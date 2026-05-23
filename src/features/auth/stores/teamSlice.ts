import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Team } from "@/types/type";

export type PlanTier = "free" | "pro" | "enterprise";

export interface TeamState {
	currentTeam: Team | null;
	plan: PlanTier;
}

const initialState: TeamState = {
	currentTeam: JSON.parse(localStorage.getItem("team") || "null"),
	plan: (localStorage.getItem("teamPlan") as PlanTier) ?? "free",
};

const teamSlice = createSlice({
	name: "team",
	initialState,
	reducers: {
		setTeam(state, action: PayloadAction<Team | null>) {
			state.currentTeam = action.payload ?? null;
			if (action.payload) {
				localStorage.setItem("team", JSON.stringify(action.payload));
			} else {
				localStorage.removeItem("team");
			}
		},
		clearTeam(state) {
			state.currentTeam = null;
			localStorage.removeItem("team");
		},
		setTeamPlan(state, action: PayloadAction<PlanTier>) {
			state.plan = action.payload;
			localStorage.setItem("teamPlan", action.payload);
		},
	},
});

export const { setTeam, clearTeam, setTeamPlan } = teamSlice.actions;
export default teamSlice.reducer;