import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { SideBarContext } from "@/contexts/sidebar-context";
import { setViewMode } from "@/features/auth/stores/authSlice";
import { setProject } from "@/features/auth/stores/projectSlice";
import { ProjectDialog } from "@/features/projects/components/project-form";
import { useAppDispatch, useAppSelector } from "@/hooks/useAuth";
import { type Project, ViewMode, ViewModeLabel } from "@/types/type";
import { AddListOrTaskPopover } from "./add-task-list";
import { ModeToggle } from "./mode-toggle";
import { NotificationBell } from "./notification-bell";
import ViewModeDropdown from "./view-model";
import { GlobalSearch } from "./global-search";

export function SiteHeader({
	projects,
}: {
	projects: Project[];
}) {
	const viewMode = useAppSelector((s) => s.auth.viewMode);
	const currentProject = useAppSelector((s) => s.project.currentProject);
	const {
		handleCreateProject,
		refetchProject,
		selectedProject: selectedProjectContext,
	} = React.useContext(SideBarContext)!;
	const [mode, setMode] = React.useState<ViewMode>(
		viewMode ?? ViewMode.LIST,
	);

	const [selectedProject, setSelectedProject] = React.useState<
		Project | undefined
	>(selectedProjectContext);
	const dispatch = useAppDispatch();
	const handleChangeMode = (value: ViewMode) => {
		setMode(value);
		dispatch(setViewMode(value));
	};

	const handleChange = (value: string) => {
		const id = Number(value);
		const foundProject = projects.find((p) => Number(p.id) === id);
		if (foundProject) {
			setSelectedProject(foundProject);
			dispatch(setProject(foundProject));
		}
	};

	React.useEffect(() => {
		if (currentProject) {
			setSelectedProject(currentProject);
		} else {
			setSelectedProject(selectedProjectContext);
		}
	}, [currentProject, selectedProjectContext]);
	return (
		<header className="sticky top-0 z-12 bg-background flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
			<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
				<SidebarTrigger className="-ml-1" />
				<Separator
					orientation="vertical"
					className="mx-2 data-[orientation=vertical]:h-4"
				/>
				{projects && projects.length > 0 && (
					<>
						<Select
							onValueChange={handleChange}
							value={String(selectedProject?.id)}
						>
							<SelectTrigger className="w-auto border-0 focus:ring-0 focus:outline-none shadow-none">
								<SelectValue placeholder="Select a Project" />
							</SelectTrigger>
							<SelectContent>
								{projects.map((project) => {
									return (
										<SelectItem value={String(project.id)}>
											{project.name}
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
						<ProjectDialog
							onSubmit={handleCreateProject}
							refetch={refetchProject}
						/>
					</>
				)}
				<div className="ml-auto flex items-center gap-2">
					<GlobalSearch />
					{projects && projects.length > 0 && <AddListOrTaskPopover />}
					<ViewModeDropdown
						value={mode}
						onChange={handleChangeMode}
						label={ViewModeLabel[mode]}
					/>
					<ModeToggle />

					<NotificationBell />
				</div>
			</div>
		</header>
	);
}
