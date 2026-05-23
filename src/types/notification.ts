export type NotificationType =
	| "TASK_ASSIGNED"
	| "TASK_UPDATED"
	| "COMMENT_ADDED"
	| "MENTIONED"
	| "SYSTEM";

export type Severity = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface Notification {
	id: number;
	userId: string;
	type: NotificationType;
	severity: Severity;
	title: string;
	message?: string;
	link?: string;
	isRead: boolean;
	metadata?: Record<string, unknown>;
	createdAt: string;
	readAt?: string;
}

export interface NotificationsResponse {
	success: boolean;
	data: Notification[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface UnreadCountResponse {
	success: boolean;
	count: number;
}

export interface SingleNotificationResponse {
	success: boolean;
	data: Notification;
}
