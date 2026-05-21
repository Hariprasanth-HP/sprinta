import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project, Task } from "@/types/type";

export interface ProjectState {
	currentProject: Project | null;
	projects: Project[];
	tasks: Task[];
}

const initialState: ProjectState = {
	currentProject: JSON.parse(localStorage.getItem("project") || "null"),
	projects: [],
	tasks: [],
};

const projectSlice = createSlice({
	name: "project",
	initialState,
	reducers: {
		setProject(state, action: PayloadAction<Project | null>) {
			state.currentProject = action.payload ?? null;
			if (action.payload) {
				localStorage.setItem("project", JSON.stringify(action.payload));
			} else {
				localStorage.removeItem("project");
			}
		},
		setProjects(state, action: PayloadAction<Project[]>) {
			state.projects = action.payload ?? [];
		},
		addProject(state, action: PayloadAction<Project>) {
			state.projects = [...state.projects, action.payload];
		},
		clearProject(state) {
			state.currentProject = null;
			localStorage.removeItem("project");
		},
		setTasks(state, action: PayloadAction<Task[]>) {
			state.tasks = action.payload ?? [];
		},
		addTask(state, action: PayloadAction<Task>) {
			state.tasks = [...state.tasks, action.payload];
		},
		updateTask(state, action: PayloadAction<Task>) {
			state.tasks = state.tasks.map((t) =>
				t.id === action.payload.id ? action.payload : t,
			);
		},
	},
});

export const { setProject, setProjects, addProject, clearProject, setTasks, addTask, updateTask } =
	projectSlice.actions;
export default projectSlice.reducer;