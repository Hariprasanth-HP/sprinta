import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/stores/authSlice";
import projectReducer from "@/features/project/stores/projectSlice";
import statusReducer from "@/features/project/stores/statusSlice";
import teamReducer from "@/features/team/stores/teamSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		project: projectReducer,
		statuses: statusReducer,
		team: teamReducer,
	},
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;