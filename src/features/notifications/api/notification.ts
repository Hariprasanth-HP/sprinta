import {
	apiDelete,
	apiGet,
	apiPatch,
} from "@/lib/apiClient";
import type { NotificationsResponse, SingleNotificationResponse, UnreadCountResponse } from "@/types/notification";

export const getNotificationsApi = (
	page = 1,
	limit = 20,
	isRead?: boolean,
) => {
	let path = `/notifications?page=${page}&limit=${limit}`;
	if (isRead !== undefined) path += `&isRead=${isRead}`;
	return apiGet<NotificationsResponse>(path);
};

export const getNotificationApi = (id: number) =>
	apiGet<SingleNotificationResponse>(`/notifications/${id}`);

export const getUnreadCountApi = () =>
	apiGet<UnreadCountResponse>("/notifications/unread-count");

export const markAsReadApi = (id: number) =>
	apiPatch<{ success: boolean }>(`/notifications/${id}/read`);

export const markAllAsReadApi = () =>
	apiPatch<{ success: boolean }>("/notifications/read-all");

export const deleteNotificationApi = (id: number) =>
	apiDelete<{ success: boolean }>(`/notifications/${id}`);
