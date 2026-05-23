import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, ListTodo, Users, Info, X, Plus, FolderPlus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppSelector } from "@/hooks/useAuth";
import { useSearch } from "@/contexts/search-context";

type SearchItem = {
	id: string;
	title: string;
	description?: string;
	type: "project" | "task" | "team" | "page" | "action" | "notification";
	icon: React.ReactNode;
	onClick: () => void;
};

export function GlobalSearch() {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");
	const navigate = useNavigate();
	const inputRef = useRef<HTMLInputElement>(null);

	const { openTaskDialog, openProjectDialog, openTaskDetails, openNotificationDetail } = useSearch();

	const currentProject = useAppSelector((s) => s.project.currentProject);
	const currentTeam = useAppSelector((s) => s.team.currentTeam);
	const tasks = useAppSelector((s) => s.project.tasks ?? []);
	const projects = useAppSelector((s) => s.project.projects ?? []);
	const notifications = useAppSelector((s) => s.notifications.notifications ?? []);

	useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};
		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const items = useMemo<SearchItem[]>(() => {
		const all: SearchItem[] = [];

		if (currentTeam) {
			all.push({
				id: `team-${currentTeam.id}`,
				title: currentTeam.name,
				description: "Team",
				type: "team",
				icon: <Users className="h-4 w-4" />,
				onClick: () => {
					navigate("/team");
					setOpen(false);
				},
			});
		}

		projects.forEach((project) => {
			all.push({
				id: `project-${project.id}`,
				title: project.name,
				description: `Project • ${project.description ?? "No description"}`,
				type: "project",
				icon: <FileText className="h-4 w-4" />,
				onClick: () => {
					navigate(`/team/${currentTeam?.id}/project/${project.id}`);
					setOpen(false);
				},
			});
		});

		tasks.forEach((task) => {
			all.push({
				id: `task-${task.id}`,
				title: `#${task.id} ${task.name}`,
				description: task.description ?? undefined,
				type: "task",
				icon: <ListTodo className="h-4 w-4" />,
				onClick: () => {
					openTaskDetails(task);
					setOpen(false);
				},
			});
		});

		notifications.forEach((n) => {
			all.push({
				id: `notification-${n.id}`,
				title: n.title,
				description: n.message ?? undefined,
				type: "notification",
				icon: <Bell className="h-4 w-4" />,
				onClick: () => {
					openNotificationDetail(n.id);
					setOpen(false);
				},
			});
		});

		all.push(
			{
				id: "action-add-task",
				title: "Add New Task",
				description: "Create a new task in current project",
				type: "action",
				icon: <Plus className="h-4 w-4" />,
				onClick: () => {
					openTaskDialog(undefined, "create");
					setOpen(false);
				},
			},
			{
				id: "action-create-project",
				title: "Create Project",
				description: "Create a new project",
				type: "action",
				icon: <FolderPlus className="h-4 w-4" />,
				onClick: () => {
					openProjectDialog();
					setOpen(false);
				},
			},
			{
				id: "action-manage-members",
				title: "Manage Members",
				description: "View and manage team members",
				type: "action",
				icon: <Users className="h-4 w-4" />,
				onClick: () => {
					navigate("/team");
					setOpen(false);
				},
			},
			{
				id: "page-about",
				title: "About",
				description: "Learn about Sprinta",
				type: "page",
				icon: <Info className="h-4 w-4" />,
				onClick: () => {
					navigate("/about");
					setOpen(false);
				},
			},
			{
				id: "page-team",
				title: "Team Settings",
				description: "Manage your team",
				type: "page",
				icon: <Users className="h-4 w-4" />,
				onClick: () => {
					navigate("/team");
					setOpen(false);
				},
			},
		);

		return all;
	}, [currentTeam, currentProject, projects, tasks, notifications, navigate, openTaskDialog, openProjectDialog, openTaskDetails, openNotificationDetail]);

	const filtered = useMemo(() => {
		if (!query.trim()) return items;
		const lower = query.toLowerCase();
		return items.filter(
			(item) =>
				item.title.toLowerCase().includes(lower) ||
				item.description?.toLowerCase().includes(lower),
		);
	}, [items, query]);

	const getTypeColor = (type: SearchItem["type"]) => {
		switch (type) {
			case "project":
				return "bg-blue-500/20 text-blue-400";
			case "task":
				return "bg-green-500/20 text-green-400";
			case "team":
				return "bg-purple-500/20 text-purple-400";
			case "page":
				return "bg-slate-500/20 text-slate-400";
			case "action":
				return "bg-orange-500/20 text-orange-400";
			case "notification":
				return "bg-rose-500/20 text-rose-400";
		}
	};

	return (
		<>
			<Button
				variant="ghost"
				size="sm"
				className="gap-2 text-muted-foreground"
				onClick={() => setOpen(true)}
			>
				<Search className="h-4 w-4" />
				<span className="hidden sm:inline text-xs">Search</span>
				<kbd className="hidden sm:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
					<span className="text-xs">⌘</span>K
				</kbd>
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="p-0 gap-0 max-w-lg overflow-hidden">
					<div className="flex items-center border-b px-4">
						<Search className="h-4 w-4 text-muted-foreground shrink-0" />
						<Input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search projects, tasks, actions..."
							className="border-0 shadow-none focus-visible:ring-0 text-base h-12"
						/>
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 shrink-0"
							onClick={() => setOpen(false)}
						>
							<X className="h-4 w-4" />
						</Button>
					</div>

					<div className="max-h-[400px] overflow-y-auto p-2">
						{filtered.length === 0 ? (
							<div className="p-4 text-center text-sm text-muted-foreground">
								No results found
							</div>
						) : (
							<div className="space-y-1">
								{filtered.map((item) => (
									<button
										key={item.id}
										onClick={item.onClick}
										className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors"
									>
										<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
											{item.icon}
										</div>
										<div className="flex-1 min-w-0">
											<p className="font-medium truncate">{item.title}</p>
											{item.description && (
												<p className="text-xs text-muted-foreground truncate">
													{item.description}
												</p>
											)}
										</div>
										<span
											className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase ${getTypeColor(
												item.type,
											)}`}
										>
											{item.type}
										</span>
									</button>
								))}
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}