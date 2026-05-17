import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Project } from "@/types/type";

export interface ProjectState {
	currentProject: Project | null;
	projects: Project[];
}

const initialState: ProjectState = {
	currentProject: JSON.parse(localStorage.getItem("project") || "null"),
	projects: [],
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
	},
});

export const { setProject, setProjects, addProject, clearProject } =
	projectSlice.actions;
export default projectSlice.reducer;