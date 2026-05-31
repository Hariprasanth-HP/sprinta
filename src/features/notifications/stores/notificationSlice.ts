import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
	deleteNotificationApi,
	getNotificationApi,
	getNotificationsApi,
	getUnreadCountApi,
	markAllAsReadApi,
	markAsReadApi,
} from "@/features/notifications/api/notification";
import type { Notification } from "@/types/notification";

interface NotificationState {
	notifications: Notification[];
	unreadCount: number;
	loading: boolean;
	error: string | null;
	totalPages: number;
}

const initialState: NotificationState = {
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,
	totalPages: 1,
};

export const fetchNotifications = createAsyncThunk(
	"notifications/fetchAll",
	async (params: { page?: number; limit?: number; isRead?: boolean }) => {
		const res = await getNotificationsApi(params.page, params.limit, params.isRead);
		return res;
	},
);

export const fetchNotificationById = createAsyncThunk(
	"notifications/fetchById",
	async (id: number) => {
		const res = await getNotificationApi(id);
		return res.data;
	},
);

export const fetchUnreadCount = createAsyncThunk(
	"notifications/fetchUnreadCount",
	async () => {
		const res = await getUnreadCountApi();
		return res.count;
	},
);

export const markAsRead = createAsyncThunk(
	"notifications/markAsRead",
	async (id: number) => {
		await markAsReadApi(id);
		return id;
	},
);

export const markAllAsRead = createAsyncThunk(
	"notifications/markAllAsRead",
	async () => {
		await markAllAsReadApi();
	},
);

export const deleteNotification = createAsyncThunk(
	"notifications/delete",
	async (id: number) => {
		await deleteNotificationApi(id);
		return id;
	},
);

const notificationSlice = createSlice({
	name: "notifications",
	initialState,
	reducers: {
		addNotification(state, action: PayloadAction<Notification>) {
			state.notifications.unshift(action.payload);
			if (!action.payload.isRead) {
				state.unreadCount += 1;
			}
		},
		decrementUnreadCount(state) {
			if (state.unreadCount > 0) state.unreadCount -= 1;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchNotifications.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNotifications.fulfilled, (state, action) => {
				state.loading = false;
				const { page } = action.meta.arg;
				if (page && page > 1) {
					const existingIds = new Set(state.notifications.map((n) => n.id));
					const newOnes = action.payload.data.filter(
						(n) => !existingIds.has(n.id),
					);
					state.notifications = [...state.notifications, ...newOnes];
				} else {
					state.notifications = action.payload.data;
				}
				state.totalPages = action.payload.meta.totalPages;
			})
			.addCase(fetchNotifications.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch notifications";
			})
			.addCase(fetchUnreadCount.fulfilled, (state, action) => {
				state.unreadCount = action.payload;
			})
			.addCase(fetchNotificationById.pending, (state) => {
				state.loading = true;
				state.error = null;
			})
			.addCase(fetchNotificationById.fulfilled, (state, action) => {
				state.loading = false;
				const exists = state.notifications.find((n) => n.id === action.payload.id);
				if (!exists) {
					state.notifications.push(action.payload);
				}
			})
			.addCase(fetchNotificationById.rejected, (state, action) => {
				state.loading = false;
				state.error = action.error.message ?? "Failed to fetch notification";
			})
			.addCase(markAsRead.fulfilled, (state, action) => {
				const idx = state.notifications.findIndex((n) => n.id === action.payload);
				if (idx !== -1) {
					state.notifications[idx].isRead = true;
					state.notifications[idx].readAt = new Date().toISOString();
				}
				if (state.unreadCount > 0) state.unreadCount -= 1;
			})
			.addCase(markAllAsRead.fulfilled, (state) => {
				state.notifications.forEach((n) => {
					n.isRead = true;
					n.readAt = new Date().toISOString();
				});
				state.unreadCount = 0;
			})
			.addCase(deleteNotification.fulfilled, (state, action) => {
				state.notifications = state.notifications.filter(
					(n) => n.id !== action.payload,
				);
			});
	},
});

export const { addNotification, decrementUnreadCount } = notificationSlice.actions;

export default notificationSlice.reducer;
