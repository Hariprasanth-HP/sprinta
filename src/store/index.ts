import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/stores/authSlice";
import projectReducer from "@/features/auth/stores/projectSlice";
import statusReducer from "@/features/auth/stores/statusSlice";
import teamReducer from "@/features/auth/stores/teamSlice";
import notificationReducer from "@/features/notifications/stores/notificationSlice";

export const store = configureStore({
	reducer: {
		auth: authReducer,
		project: projectReducer,
		statuses: statusReducer,
		team: teamReducer,
		notifications: notificationReducer,
	},
});
export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;