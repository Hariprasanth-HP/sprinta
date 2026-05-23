import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Task } from "@/types/type";

interface SearchContextType {
	openTaskDialog: (task?: Task, type?: "create" | "edit") => void;
	closeTaskDialog: () => void;
	openProjectDialog: () => void;
	closeProjectDialog: () => void;
	openTaskDetails: (task: Task) => void;
	closeTaskDetails: () => void;
	showTaskDialog: boolean;
	taskDialogType: "create" | "edit";
	selectedTaskForDialog: Task | undefined;
	showProjectDialog: boolean;
	showTaskDetails: boolean;
	selectedTaskForDetails: Task | undefined;
	selectedNotificationId: number | null;
	openNotificationDetail: (id: number) => void;
	closeNotificationDetail: () => void;
}

const SearchContext = createContext<SearchContextType | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
	const [showTaskDialog, setShowTaskDialog] = useState(false);
	const [taskDialogType, setTaskDialogType] = useState<"create" | "edit">("create");
	const [selectedTaskForDialog, setSelectedTaskForDialog] = useState<Task | undefined>();
	const [showProjectDialog, setShowProjectDialog] = useState(false);
	const [showTaskDetails, setShowTaskDetails] = useState(false);
	const [selectedTaskForDetails, setSelectedTaskForDetails] = useState<Task | undefined>();
	const [selectedNotificationId, setSelectedNotificationId] = useState<number | null>(null);

	const openTaskDialog = useCallback((task?: Task, type: "create" | "edit" = "create") => {
		setSelectedTaskForDialog(task);
		setTaskDialogType(type);
		setShowTaskDialog(true);
	}, []);

	const closeTaskDialog = useCallback(() => {
		setShowTaskDialog(false);
		setSelectedTaskForDialog(undefined);
	}, []);

	const openProjectDialog = useCallback(() => {
		setShowProjectDialog(true);
	}, []);

	const closeProjectDialog = useCallback(() => {
		setShowProjectDialog(false);
	}, []);

	const openTaskDetails = useCallback((task: Task) => {
		setSelectedTaskForDetails(task);
		setShowTaskDetails(true);
	}, []);

	const closeTaskDetails = useCallback(() => {
		setShowTaskDetails(false);
		setSelectedTaskForDetails(undefined);
	}, []);

	const openNotificationDetail = useCallback((id: number) => {
		setSelectedNotificationId(id);
	}, []);

	const closeNotificationDetail = useCallback(() => {
		setSelectedNotificationId(null);
	}, []);

	return (
		<SearchContext.Provider
			value={{
				openTaskDialog,
				closeTaskDialog,
				openProjectDialog,
				closeProjectDialog,
				openTaskDetails,
				closeTaskDetails,
				showTaskDialog,
				taskDialogType,
				selectedTaskForDialog,
				showProjectDialog,
				showTaskDetails,
				selectedTaskForDetails,
				selectedNotificationId,
				openNotificationDetail,
				closeNotificationDetail,
			}}
		>
			{children}
		</SearchContext.Provider>
	);
}

export function useSearch() {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
}