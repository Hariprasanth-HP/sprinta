import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Team } from "@/types/type";

export interface TeamState {
	currentTeam: Team | null;
}

const initialState: TeamState = {
	currentTeam: JSON.parse(localStorage.getItem("team") || "null"),
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
	},
});

export const { setTeam, clearTeam } = teamSlice.actions;
export default teamSlice.reducer;