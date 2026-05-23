import { Loader2, Bell, Trash2, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	fetchNotificationById,
	deleteNotification,
	markAsRead,
} from "@/features/notifications/stores/notificationSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAuth";
import { useSearch } from "@/contexts/search-context";
import { Button } from "@/components/ui/button";

const severityColors: Record<string, string> = {
	LOW: "bg-slate-500/20 text-slate-400",
	NORMAL: "bg-sky-500/20 text-sky-400",
	HIGH: "bg-amber-500/20 text-amber-400",
	URGENT: "bg-red-500/20 text-red-400",
};

const typeLabels: Record<string, string> = {
	TASK_ASSIGNED: "Task Assigned",
	TASK_UPDATED: "Task Updated",
	COMMENT_ADDED: "Comment Added",
	MENTIONED: "Mentioned",
	SYSTEM: "System",
};

export function NotificationDetailDialog() {
	const dispatch = useAppDispatch();
	const {
		selectedNotificationId,
		closeNotificationDetail,
	} = useSearch();
	const { notifications, loading } = useAppSelector((s) => s.notifications);

	const notification = notifications.find(
		(n) => n.id === selectedNotificationId,
	);

	useEffect(() => {
		if (selectedNotificationId && !notification) {
			dispatch(fetchNotificationById(selectedNotificationId));
		}
	}, [selectedNotificationId, notification, dispatch]);

	function handleMarkRead() {
		if (!notification) return;
		dispatch(markAsRead(notification.id));
	}

	function handleDelete() {
		if (!notification) return;
		dispatch(deleteNotification(notification.id));
		closeNotificationDetail();
	}

	return (
		<Dialog
			open={selectedNotificationId !== null}
			onOpenChange={(open) => { if (!open) closeNotificationDetail(); }}
		>
			<DialogContent className="sm:max-w-[480px]">
				<DialogHeader>
					<DialogTitle>Notification</DialogTitle>
				</DialogHeader>

				{loading && !notification ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
					</div>
				) : !notification ? (
					<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
						<Bell className="h-8 w-8 mb-2 opacity-40" />
						<p className="text-sm">Notification not found</p>
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex items-center gap-2">
							<span
								className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
									severityColors[notification.severity] ?? "bg-sky-500/20 text-sky-400"
								}`}
							>
								{notification.severity}
							</span>
							<span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
								{typeLabels[notification.type] ?? notification.type}
							</span>
							<span className="text-xs text-muted-foreground ml-auto">
								#{notification.id}
							</span>
						</div>

						<div>
							<h3 className="text-base font-semibold">{notification.title}</h3>
							{notification.message && (
								<p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
									{notification.message}
								</p>
							)}
						</div>

						<div className="text-xs text-muted-foreground space-y-1">
							<p>
								Created:{" "}
								{new Date(notification.createdAt).toLocaleString()}
							</p>
							{notification.readAt && (
								<p>
									Read:{" "}
									{new Date(notification.readAt).toLocaleString()}
								</p>
							)}
							{notification.link && (
								<p className="truncate">
									Link:{" "}
									<span className="text-sky-400">{notification.link}</span>
								</p>
							)}
						</div>

						<div className="flex items-center gap-2 pt-2 border-t">
							{!notification.isRead && (
								<Button
									variant="outline"
									size="sm"
									onClick={handleMarkRead}
								>
									<CheckCheck className="h-4 w-4 mr-1.5" />
									Mark as read
								</Button>
							)}
							<Button
								variant="outline"
								size="sm"
								className="text-destructive hover:text-destructive"
								onClick={handleDelete}
							>
								<Trash2 className="h-4 w-4 mr-1.5" />
								Delete
							</Button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}

export default NotificationDetailDialog;
