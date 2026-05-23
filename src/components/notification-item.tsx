import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";

const severityColors: Record<string, string> = {
	LOW: "bg-slate-400",
	NORMAL: "bg-sky-500",
	HIGH: "bg-amber-500",
	URGENT: "bg-red-500",
};

function timeAgo(dateStr: string): string {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diff = now - then;
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	if (days < 7) return `${days}d ago`;
	return new Date(dateStr).toLocaleDateString();
}

export function NotificationItem({
	notification,
	onClick,
}: {
	notification: Notification;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 border-b border-border/50",
				!notification.isRead && "bg-accent/20",
			)}
		>
			<div
				className={cn(
					"mt-1.5 h-2 w-2 shrink-0 rounded-full",
					severityColors[notification.severity] ?? "bg-sky-500",
				)}
			/>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between gap-2">
					<span className="text-sm font-medium truncate">
						{notification.title}
					</span>
					<span className="text-xs text-muted-foreground shrink-0">
						{timeAgo(notification.createdAt)}
					</span>
				</div>
				{notification.message && (
					<p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
						{notification.message}
					</p>
				)}
			</div>
		</button>
	);
}
