import { Bell, BellRing, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	fetchNotifications,
	fetchUnreadCount,
	markAllAsRead,
	markAsRead,
	addNotification,
} from "@/features/notifications/stores/notificationSlice";
import { useAppDispatch, useAppSelector } from "@/hooks/useAuth";
import { LoadMore } from "@/components/ui/pagination";
import { useSearch } from "@/contexts/search-context";
import { usePagination } from "@/hooks/usePagination";
import { initSocket } from "@/lib/socket";
import type { Notification } from "@/types/notification";
import { NotificationItem } from "./notification-item";

export function NotificationBell() {
	const { openNotificationDetail } = useSearch();
	const dispatch = useAppDispatch();
	const { notifications, unreadCount, totalPages, loading } = useAppSelector(
		(s) => s.notifications,
	);
	const user = useAppSelector((s) => s.auth.user);
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("all");

	const {
		page,
		hasMore,
		setPage,
		reset: resetPage,
	} = usePagination({ pageSize: 20, totalPages });

	const currentFilter = useCallback(
		(p: number) => ({
			page: p,
			limit: 20,
			isRead:
				tab === "all"
					? undefined
					: tab === "unread"
						? false
						: true,
		}),
		[tab],
	);

	useEffect(() => {
		if (open) {
			resetPage();
			dispatch(fetchNotifications(currentFilter(1)));
		}
	}, [open, dispatch, resetPage, currentFilter]);

	useEffect(() => {
		if (!user?.id) return;
		dispatch(fetchUnreadCount());
		dispatch(fetchNotifications(currentFilter(1)));

		const socket = initSocket(user.id);

		socket.on("notification", (data) => {
			dispatch(addNotification(data));
		});

		return () => {
			socket.off("notification");
		};
	}, [user?.id, dispatch, currentFilter]);

	useEffect(() => {
		resetPage();
		if (open) {
			dispatch(fetchNotifications(currentFilter(1)));
		}
	}, [tab, resetPage, open, dispatch, currentFilter]);

	const handleLoadMore = useCallback(() => {
		const nextPage = page + 1;
		setPage(nextPage);
		dispatch(fetchNotifications(currentFilter(nextPage)));
	}, [page, setPage, dispatch, currentFilter]);

	const filtered = useMemo(() => {
		if (tab === "unread") return notifications.filter((n) => !n.isRead);
		if (tab === "read") return notifications.filter((n) => n.isRead);
		return notifications;
	}, [notifications, tab]);

	function handleMarkAllRead() {
		dispatch(markAllAsRead());
	}

	function handleNotificationClick(n: Notification) {
		dispatch(markAsRead(n.id));
		dispatch(fetchUnreadCount());
		setOpen(false);
		openNotificationDetail(n.id);
	}

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="relative"
					aria-label="Notifications"
				>
					{unreadCount > 0 ? (
						<>
							<BellRing className="h-5 w-5" />
							<span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
								{unreadCount > 99 ? "99+" : unreadCount}
							</span>
						</>
					) : (
						<Bell className="h-5 w-5" />
					)}
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-full sm:w-[400px] p-0 flex flex-col"
			>
				<SheetHeader className="px-4 py-3 border-b shrink-0">
					<div className="flex items-center justify-between">
						<SheetTitle className="text-base">Notifications</SheetTitle>
						{unreadCount > 0 && (
							<Button
								variant="ghost"
								size="sm"
								className="text-xs h-7"
								onClick={handleMarkAllRead}
							>
								Mark all as read
							</Button>
						)}
					</div>
				</SheetHeader>

				<Tabs
					value={tab}
					onValueChange={setTab}
					className="flex flex-col flex-1 min-h-0"
				>
					<div className="px-4 pt-2 shrink-0">
						<TabsList className="w-full">
							<TabsTrigger value="all" className="flex-1 text-xs">
								All
							</TabsTrigger>
							<TabsTrigger value="unread" className="flex-1 text-xs">
								Unread
								{unreadCount > 0 && (
									<span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
										{unreadCount > 99 ? "99+" : unreadCount}
									</span>
								)}
							</TabsTrigger>
							<TabsTrigger value="read" className="flex-1 text-xs">
								Read
							</TabsTrigger>
						</TabsList>
					</div>

					<div className="flex-1 overflow-y-auto min-h-0">
						{loading && notifications.length === 0 ? (
							<div className="flex items-center justify-center py-12">
								<Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
							</div>
						) : filtered.length === 0 ? (
							<div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
								<Bell className="h-8 w-8 mb-2 opacity-40" />
								<p className="text-sm">No notifications</p>
							</div>
						) : (
							<>
								{filtered.map((n) => (
									<NotificationItem
										key={n.id}
										notification={n}
										onClick={() => handleNotificationClick(n)}
									/>
								))}
								<LoadMore
									onLoadMore={handleLoadMore}
									loading={loading}
									hasMore={hasMore}
									label="Load older notifications"
								/>
							</>
						)}
					</div>
				</Tabs>
			</SheetContent>
		</Sheet>
	);
}

export default NotificationBell;
