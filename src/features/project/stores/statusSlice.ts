import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskStatus } from "@/types/type";

export interface StatusState {
	statuses: TaskStatus[];
}

const initialState: StatusState = {
	statuses: [],
};

const statusSlice = createSlice({
	name: "statuses",
	initialState,
	reducers: {
		setStatuses(state, action: PayloadAction<TaskStatus[]>) {
			state.statuses = action.payload ?? [];
		},
		addStatus(state, action: PayloadAction<TaskStatus>) {
			const status = action.payload;
			if (!status) return;
			state.statuses = [...state.statuses, status];
		},
		updateStatus(state, action: PayloadAction<TaskStatus>) {
			const updated = action.payload;
			if (!updated || !state.statuses) return;
			state.statuses = state.statuses.map((s) =>
				s.id === updated.id ? updated : s,
			);
		},
		removeStatus(state, action: PayloadAction<{ statusId: number }>) {
			const { statusId } = action.payload;
			if (statusId === undefined || !state.statuses) return;
			state.statuses = state.statuses.filter((s) => s.id !== statusId);
		},
		clearStatuses(state) {
			state.statuses = [];
		},
	},
});

export const {
	setStatuses,
	addStatus,
	updateStatus,
	removeStatus,
	clearStatuses,
} = statusSlice.actions;
export default statusSlice.reducer;