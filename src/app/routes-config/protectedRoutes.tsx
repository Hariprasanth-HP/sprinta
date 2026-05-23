// src/AppRoutes.tsx
import React, {
	type JSX,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Route, Routes } from "react-router-dom";
import { toast } from "sonner";
import AppErrorBoundary from "@/app/error-boundary/error-boundary";
import BillingPage from "@/app/routes/billing/page";
import Page from "@/app/routes/Dashboard/page";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { NotificationDetailDialog } from "@/components/notification-detail-dialog";
import { ThemeProvider, useTheme } from "@/components/theme-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SideBarContext } from "@/contexts/sidebar-context";
import { setProject } from "@/features/auth/stores/projectSlice";
import { useFetchlistsFromProject } from "@/features/projects/api/list";
import {
	type CreateProjectPayload,
	useCreateProject,
	useProjects,
} from "@/features/projects/api/projects";
import { useStatuses } from "@/features/projects/api/status";
import { useFetchtasksFromProject } from "@/features/projects/api/task";
import { useFetchMembersForTeam } from "@/features/teams/api/member";
import { useFetchteam } from "@/features/teams/api/team";
import { useAppDispatch, useAppSelector } from "@/hooks/useAuth";
import type { AuthState } from "@/types/auth";
// types generated from your Prisma schema (drop-in file)
import type {
	List,
	Project,
	SidebarContextValue,
	Task,
	Team,
	TeamMember,
} from "@/types/type";
import { RequireAuth } from "./RequireAuth";
export default function ProtectedRoutes(): JSX.Element {
	const { theme } = useTheme();

	const auth = useAppSelector((s: { auth: AuthState }) => s.auth);
	const currentTeam = useAppSelector((s) => s.team.currentTeam);
	const currentProject = useAppSelector((s) => s.project.currentProject);
	const dispatch = useAppDispatch();

	// Selected project & team managed locally (keeps UI independent of auth until dispatch)
	const [selectedProject, setSelectedProject] = useState<Project | undefined>(
		currentProject ?? undefined,
	);
	const projectsQuery = useProjects({ id: currentTeam?.id });
	const projects: Project[] = useMemo(
		() => projectsQuery.data ?? [],
		[projectsQuery.data],
	);
	const projectsLoading = projectsQuery.isLoading ?? false;
	const statusesQuery = useStatuses(
		dispatch,
		currentProject?.id ?? selectedProject?.id,
	);
	const statuses = statusesQuery.data;

	// Mutations / helper API hooks (assumed shapes)
	const createProject = useCreateProject();
	const fetchTeam = useFetchteam();
	const { data: membersData } = useFetchMembersForTeam(currentTeam?.id);
	const fetchLists = useFetchlistsFromProject();
	const fetchTasks = useFetchtasksFromProject();

	// UI/local state (typed)
	const [projectsState, setProjectsState] = useState<Project[]>([]);
	const [usersList, setUsersList] = useState<TeamMember[]>([]);
	const [listForTableState, setListForTableState] = useState<List[]>([]);
	const [taskForTableState, setTaskForTableState] = useState<Task[]>([]);

	const [selectedTeam, setSelectedTeam] = useState<Team | undefined>(
		currentTeam ?? undefined,
	);

	// Derived memos
	const listForTable = useMemo(
		() => listForTableState ?? [],
		[listForTableState],
	);

	// ---- Sync server projects into local projectsState ----
	useEffect(() => {

		async function setProjects() {
			if (projects && projects.length > 0) {
				const currentProjectStr = localStorage.getItem("project")
				if (currentProjectStr) {
					const currentProject = JSON.parse(currentProjectStr) as Project;
					if (currentProject.teamId !== currentTeam?.id) {
						localStorage.removeItem("project");
					}
					else {
						setSelectedProject(currentProject);
						await dispatch(setProject(currentProject));
					}
				}
				else {
					setSelectedProject(projects?.[0]);
					await dispatch(setProject(projects?.[0]));
				}

				setProjectsState(projects);
			} else {
				setProjectsState([]);
			}
		}
		setProjects()
	}, [projects]);

	// ---- On mount: fetch team details and members (if auth.userTeam exists) ----
	useEffect(() => {
		let mounted = true;

		async function bootTeamAndMembers() {
			if (!currentTeam?.id) return;

			try {
				const { data } = await fetchTeam.mutateAsync({ id: currentTeam.id });
				if (mounted && data) {
					setSelectedTeam(data);
				}

				if (mounted && membersData) {
					setUsersList(membersData);
				}

				// reconcile stored project in localStorage (if any)
				const existingProjectStr = localStorage.getItem("project");
				if (existingProjectStr && mounted) {
					try {
						const parsedProject = JSON.parse(existingProjectStr) as Project;
						if (parsedProject?.teamId !== currentTeam?.id) {
							localStorage.removeItem("project");
							setSelectedProject(undefined);
						}
					} catch {
						localStorage.removeItem("project");
						setSelectedProject(undefined);
					}
				}
			} catch (e) {
				void e;
			}
		}

		bootTeamAndMembers();

		return () => {
			mounted = false;
		};
	}, [membersData, currentTeam?.id]);

	// ---- Keep selectedProject in sync with auth.userProject (auth is the source-of-truth) ----
	useEffect(() => {
		if (currentProject) {
			setSelectedProject(currentProject);
		} else if (projects.length > 0) {
			setSelectedProject(projects?.[0]);
		} else {
			setSelectedProject(undefined);
		}
	}, [currentProject, projects]);

	// ---- When selectedProject changes -> fetch lists & tasks for it ----
	useEffect(() => {
		let mounted = true;

		async function loadProjectData(project?: Project) {
			if (!project?.id) {
				// clear UI data when there's no selected project
				setTaskForTableState([]);
				setListForTableState([]);
				return;
			}

			try {
				const [tasksRes, listsRes] = await Promise.all([
					fetchTasks.mutateAsync({ projectId: project.id }),
					fetchLists.mutateAsync({ projectId: project.id }),
				]);

				if (!mounted) return;

				if (tasksRes?.data) {
					setTaskForTableState(tasksRes.data);
				} else {
					setTaskForTableState([]);
				}

				if (listsRes?.data) {
					setListForTableState(listsRes.data);
				} else {
					setListForTableState([]);
				}
			} catch (e) {
				void e;
			}
		}

		loadProjectData(selectedProject);

		return () => {
			mounted = false;
		};
		// include selectedProject.id so effect re-runs when project changed
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedProject?.id]);

	const handleCreateProject = useCallback(
		async (projectPayload: Partial<Project>): Promise<Project | undefined> => {
			const teamId = currentTeam?.id;
			if (!teamId) {
				toast.error("Cannot create project: missing team");
				return;
			}

			// Build a well-typed payload so the mutation's input type matches
			const payload: CreateProjectPayload = {
				// prefer explicit fields instead of spreading unknown Partial<Project>
				name: (projectPayload.name as string) ?? "Untitled project",
				description: projectPayload.description,
				creatorId: (projectPayload.creatorId as number) ?? auth.user?.id ?? 0,
				teamId,
			};

			try {
				const createdProject = await createProject.mutateAsync(payload);

				// createdProject is typed Project thanks to unwrap above
				setSelectedProject(createdProject);
				// dispatch synchronously — no need for setTimeout
				dispatch(setProject(createdProject));

				toast.success("Project created successfully");
				return createdProject;
			} catch (err: unknown) {
				const message =
					typeof err === "object" && err !== null && "message" in err
						? String(err.message)
						: "Failed to create project";

				toast.error(message);
				return;
			}
		},
		[currentTeam?.id, auth.user?.id, createProject, dispatch],
	);

	// Refetch projects convenience wrapper
	const refetchProjects = useCallback(() => {
		projectsQuery.refetch?.();
	}, [projectsQuery]);

	// Build SidebarContext value (typed)
	const sidebarContextValue: SidebarContextValue = useMemo(() => {
		return {
			setTaskForTableState,
			setListForTableState,
			setSelectedProject,
			selectedProject,
			usersList,
			projectsState,
			listForTable,
			taskForTableState,
			team: selectedTeam as Team, // selectedTeam could be undefined initially
			handleCreateProject,
			refetchProject: refetchProjects,
			isLoading: projectsLoading,
			setProjectsState,
			statuses,
		} as SidebarContextValue;
	}, [
		selectedProject,
		usersList,
		projectsState,
		listForTable,
		taskForTableState,
		selectedTeam,
		handleCreateProject,
		refetchProjects,
		projectsLoading,
		setProjectsState,
		statuses,
	]);

	return (
		<ThemeProvider defaultTheme={theme} storageKey="vite-ui-theme">
			<AppErrorBoundary>
				<SideBarContext.Provider value={sidebarContextValue}>
					<SidebarProvider
						style={
							{
								"--sidebar-width": "calc(var(--spacing) * 72)",
								"--header-height": "calc(var(--spacing) * 12)",
							} as React.CSSProperties
						}
					>
						<AppSidebar variant="inset" />
						<SidebarInset className="m-0 ">
							<SiteHeader projects={projectsState} />
							<Routes>
								<Route
									path="/billing"
									element={
										<RequireAuth>
											<BillingPage />
										</RequireAuth>
									}
								/>
								<Route
									path="/:id"
									element={
										<RequireAuth>
											<Page />
										</RequireAuth>
									}
								/>
							</Routes>
						</SidebarInset>
					</SidebarProvider>
					<NotificationDetailDialog />
				</SideBarContext.Provider>
			</AppErrorBoundary>
		</ThemeProvider>
	);
}
