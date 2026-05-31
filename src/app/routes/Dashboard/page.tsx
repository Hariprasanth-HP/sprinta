import { IconFolderCode, IconGripVertical } from "@tabler/icons-react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { Edit, Loader2, Trash } from "lucide-react";
import React from "react";
import { useContext, useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "../../../components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../../../components/ui/empty";
import { Input } from "../../../components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../../../components/ui/tooltip";
import { SideBarContext } from "../../../contexts/sidebar-context";
import { useSearch } from "../../../contexts/search-context";
import { useCreatetask, useRebalancetasks, useUpdatetask } from "../../../features/projects/api/task";
import { setTasks } from "../../../features/auth/stores/projectSlice";
import { useAppDispatch } from "../../../hooks/useAuth";
import DeleteTaskDialog, {
  AddTaskDialog,
} from "../../../features/projects/components/add-task-form";
import { DataTable, type TableState } from "../../../features/projects/components/data-table";
import KanbanFromData from "../../../features/projects/components/kanban-view";
import { ProjectDialog } from "../../../features/projects/components/project-form";
import { DrawerInfo } from "../../../features/projects/components/task-drawer-form";
import { useAppSelector } from "../../../hooks/useAuth";
import { type Task, ViewMode } from "../../../types/type";

const EMPTY_ARRAY: Task[] = [];

export interface List {
	id: number;
	name: string;
}

/* -----------------------------------------------------
 📄 Page Component
----------------------------------------------------- */

export default function Page() {
  const auth = useAppSelector((s: any) => s.auth);

  const {
    setTaskForTableState,
    projectsState,
    listForTable,
    handleCreateProject,
    refetchProject,
    taskForTableState,
    selectedProject,
    isLoading,
    statuses,
  } = useContext(SideBarContext)!;

  const dispatch = useAppDispatch();
  const { showTaskDialog, selectedTaskForDialog, taskDialogType, openTaskDialog, closeTaskDialog, showTaskDetails, selectedTaskForDetails, closeTaskDetails } = useSearch();

  /* ------------------ UI State ------------------ */
  const [taskOpen, setTaskOpen] = useState(false);

  const [subTaskOpen, setSubTaskOpen] = useState(false);
  const [subTask, setSubTask] = useState<Task | undefined>(undefined);

  const [showTaskDelete, setShowTaskDelete] = useState(false);
  const [taskData, setTaskData] = useState<Task | undefined>(undefined);
  const createTask = useCreatetask();

  /* Sync tasks to redux for search */
  useEffect(() => {
    if (taskForTableState && taskForTableState.length > 0) {
      dispatch(setTasks(taskForTableState));
    }
  }, [taskForTableState, dispatch]);

  /* Open task details from search */
  useEffect(() => {
    if (showTaskDetails && selectedTaskForDetails) {
      setTaskData(selectedTaskForDetails);
      setTaskOpen(true);
      closeTaskDetails();
    }
  }, [showTaskDetails, selectedTaskForDetails, closeTaskDetails]);

  /* Table State Management */
  const [tableState, setTableState] = useState<TableState>({
    sorting: undefined,
    columnWidths: {},
    expandedRows: {},
    pagination: {
      pageIndex: 0,
      pageSize: 50
    }
  });

  /* Get root tasks (tasks without listId) */
  const rootTasks = useMemo(() => {
    return (taskForTableState ?? []).filter((task) => !task.listId);
  }, [taskForTableState]);

  /* Pre-compute list tasks for stable data references */
  const listTasksMap = useMemo(() => {
    const map: Record<number, Task[]> = {};
    for (const t of taskForTableState ?? []) {
      if (t.listId) {
        if (!map[t.listId]) map[t.listId] = [];
        map[t.listId].push(t);
      }
    }
    return map;
  }, [taskForTableState]);

  /* Calculate total root tasks for pagination */
  // totalRootTasks = rootTasks.length;

  const getRowId = useCallback((row: Task) => row.id, []);
  const getChildren = useCallback((row: Task) => row.subTasks ?? EMPTY_ARRAY, []);

  const handleExpand = useCallback(async (row: Task) => {
    // For now, we're assuming all data is already loaded
    // In a real implementation, this would fetch children for the row
    if (!row.subTasks && row.id) {
      // This would normally be an API call
      // For now, we'll just log that we would load children
      console.log("Would load children for task:", row.id);
    }
  }, []);

  const updateTask = useUpdatetask();
  const rebalanceTasks = useRebalancetasks();
  const taskForTableStateRef = useRef(taskForTableState);
  taskForTableStateRef.current = taskForTableState;

  const SORT_GAP = 100000;

  const handleMove = useCallback((sourceId: string | number, targetId: string | number, position: "before" | "after" | "inside") => {
    const tasks = taskForTableStateRef.current;
    const sid = Number(sourceId);
    const tid = Number(targetId);
    if (sid === tid) return;

    const removeResult = removeTaskFromTree(tasks, sid);
    if (!removeResult) return;
    const { removed, updated: afterRemove } = removeResult;

    const targetPath = findTaskPath(afterRemove, tid);
    if (!targetPath) return;
    const { parent: targetParent, idx: targetIdx } = targetPath;

    const targetTask = findTaskInTree(afterRemove, tid);
    let newParentTaskId: number | null;
    let insertParentId: number | null;
    let insertIdx: number;

    if (targetTask && (!targetTask.subTasks || targetTask.subTasks.length === 0)) {
      newParentTaskId = tid;
      insertParentId = tid;
      insertIdx = 0;
    } else {
      newParentTaskId = targetParent ? Number(targetParent.id) : null;
      insertParentId = targetParent ? Number(targetParent.id) : null;
      insertIdx = position === "before" ? targetIdx : targetIdx + 1;
    }

    const newTree = insertIntoTree(afterRemove, insertParentId, removed, insertIdx);

    // Update local state
    setTaskForTableState(newTree);

    // Compute sortOrder from neighbors in new tree
    const parentTasks: Task[] = insertParentId === null
      ? newTree
      : (findTaskInTree(newTree, insertParentId)?.subTasks ?? []);

    const movedIdx = parentTasks.findIndex(t => t.id === sid);
    if (movedIdx === -1) return;

    const prevTask = movedIdx > 0 ? parentTasks[movedIdx - 1] : null;
    const nextTask = movedIdx < parentTasks.length - 1 ? parentTasks[movedIdx + 1] : null;

    let newSortOrder: number;
    let needsRebalance = false;

    if (!prevTask && !nextTask) {
      newSortOrder = SORT_GAP;
    } else if (!prevTask && nextTask) {
      newSortOrder = nextTask.sortOrder / 2;
    } else if (prevTask && !nextTask) {
      newSortOrder = prevTask.sortOrder + SORT_GAP;
    } else {
      newSortOrder = (prevTask!.sortOrder + nextTask!.sortOrder) / 2;
      if (nextTask!.sortOrder - prevTask!.sortOrder <= 1) {
        needsRebalance = true;
      }
    }

    // Persist moved task
    updateTask.mutateAsync({ id: sid, parentTaskId: newParentTaskId, sortOrder: newSortOrder }).catch(console.error);

    // Rebalance if gap is too tight
    if (needsRebalance) {
      rebalanceTasks.mutateAsync({ projectId: removed.projectId, parentTaskId: newParentTaskId }).catch(console.error);
    }
  }, [updateTask, rebalanceTasks]);

  const handleToggleExpand = useCallback((rowId: string) => {
    setTableState(prev => ({
      ...prev,
      expandedRows: {
        ...prev.expandedRows,
        [rowId]: !prev.expandedRows[rowId],
      },
    }));
  }, []);

  const handleSortingChange = useCallback((sorting: SortingState) => {
    setTableState(prev => ({ ...prev, sorting }));
  }, []);

  const handlePaginationChange = useCallback((pagination: { pageIndex: number; pageSize: number }) => {
    setTableState(prev => ({ ...prev, pagination }));
  }, []);

  const handleColumnResize = useCallback((sizing: Record<string, number>) => {
    setTableState(prev => ({ ...prev, columnWidths: sizing }));
  }, []);

  const handleRowClick = useCallback((_e: unknown, row: any) => {
    const item = row.original as Task;
    if (!item) return;
    setTaskData(item);
    setTaskOpen(true);
  }, []);

/* ---------- Recursive tree helpers ---------- */

function removeTaskFromTree(tasks: Task[], id: number): { removed: Task; updated: Task[] } | null {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    return { removed: tasks[idx], updated: [...tasks.slice(0, idx), ...tasks.slice(idx + 1)] };
  }
  for (let i = 0; i < tasks.length; i++) {
    const sub = tasks[i].subTasks;
    if (sub && sub.length > 0) {
      const result = removeTaskFromTree(sub, id);
      if (result) {
        const updated = { ...tasks[i], subTasks: result.updated };
        return { removed: result.removed, updated: [...tasks.slice(0, i), updated, ...tasks.slice(i + 1)] };
      }
    }
  }
  return null;
}

function findTaskPath(tasks: Task[], id: number): { parent: Task | null; idx: number } | null {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) return { parent: null, idx };
  for (const t of tasks) {
    const sub = t.subTasks;
    if (sub && sub.length > 0) {
      const subIdx = sub.findIndex((s) => s.id === id);
      if (subIdx !== -1) return { parent: t, idx: subIdx };
      const found = findTaskPath(sub, id);
      if (found) return found;
    }
  }
  return null;
}

function findTaskInTree(tasks: Task[], id: number): Task | null {
  for (const t of tasks) {
    if (t.id === id) return t;
    if (t.subTasks?.length) {
      const found = findTaskInTree(t.subTasks, id);
      if (found) return found;
    }
  }
  return null;
}

function insertIntoTree(tasks: Task[], parentId: number | null, task: Task, idx: number): Task[] {
  if (parentId === null) {
    const next = [...tasks];
    next.splice(Math.min(next.length, idx), 0, task);
    return next;
  }
  return tasks.map((t) => {
    if (t.id === parentId) {
      const sub = t.subTasks ?? [];
      const next = [...sub];
      next.splice(Math.min(next.length, idx), 0, task);
      return { ...t, subTasks: next };
    }
    if (t.subTasks && t.subTasks.length > 0) {
      return { ...t, subTasks: insertIntoTree(t.subTasks, parentId, task, idx) };
    }
    return t;
  });
}

  const columns = useMemo<ColumnDef<Task>[]>(() => {
    return [
      {
        id: "drag",
        header: () => null,
        cell: () => (
          <div className="flex items-center justify-center">
            <IconGripVertical className="text-muted-foreground size-4" />
          </div>
        ),
        enableResizing: false,
        size: 40,
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue, row }) => (
          <span
            className="font-medium"
            style={{ paddingLeft: `${(row as any).depth * 20}px` }}
          >
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ getValue }): React.ReactNode => {
          const v = getValue() as string | null;

          if (!v) {
            return (
              <p className="text-xs text-muted-foreground">
                <span className="text-muted">No description</span>
              </p>
            );
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {v}
                </p>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-[400px] break-words">
                {v}
              </TooltipContent>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: "creator",
        header: "Creator",
        cell: ({ getValue }) => getValue() ?? "—",
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: ({ getValue }) => (
          <span className="uppercase text-sm font-semibold">
            {(getValue() as string) ?? "UNKNOWN"}
          </span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: "Due",
        cell: ({ getValue }) => {
          const v = getValue() as string | null;
          return v ? new Date(v).toLocaleDateString() : "—";
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const item = row.original as Task | undefined;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                title="Edit Task"
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskDialog(item, "edit");
                }}
                className="text-primary"
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                title="Delete Task"
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskData(item);
                  setShowTaskDelete(true);
                }}
                className="text-destructive"
                disabled={item?.parentTaskId ? false : (item?.subTasks?.length ?? 0) > 0}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ];
  }, []);
  console.log("taskForTable", taskForTableState);

  /* -----------------------------------------------------
   🚦 Render States
  ----------------------------------------------------- */

  if (isLoading) {
		return (
			<div className="flex w-full h-full items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
			</div>
		);
	}

	if (!projectsState?.length) {
		return (
			<div className="flex flex-col items-center justify-center flex-1">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<IconFolderCode />
						</EmptyMedia>
						<EmptyTitle>No Projects Yet</EmptyTitle>
						<EmptyDescription>
							You haven’t created any projects yet. Start by creating one.
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<ProjectDialog
							onSubmit={handleCreateProject}
							refetch={refetchProject}
						/>
					</EmptyContent>
				</Empty>
			</div>
		);
	}

	if (!selectedProject) {
		return <>No project selected</>;
	}

	/* -----------------------------------------------------
   📋 Main Render
  ----------------------------------------------------- */
	const handleChange = (updated: Task[]) => {
		// Persist updated tasks to your API/Prisma here
		console.log("kanban changed -> persist these tasks:", updated);
		setTaskForTableState(updated);
	};

	function handleSubTaskClick(st: Task) {
		setSubTask(st);
		setSubTaskOpen(true);
	}

	return (
		<div className="overflow-y-auto flex-1 min-h-0">
			{auth.viewMode === ViewMode.KANBAN ? (
				<KanbanFromData
					statuses={statuses}
					tasks={taskForTableState ?? []}
					onChange={handleChange}
					open={taskOpen}
					task={taskData}
					setTask={setTaskData}
					setOpen={setTaskOpen}
					setTaskForTableState={setTaskForTableState}
				/>
			) : (
				<div className="flex flex-col flex-1 gap-4 py-4">
{/* Untitled List Group */}
<Input value="Untitled List" readOnly />
<DataTable
  data={rootTasks}
  columns={columns}
  state={tableState}
  getRowId={getRowId}
  getChildren={getChildren}
  onExpand={handleExpand}
  onToggleExpand={handleToggleExpand}
  onMove={handleMove}
  onRowClick={handleRowClick}
  onSortingChange={handleSortingChange}
  onPaginationChange={handlePaginationChange}
  onColumnResize={handleColumnResize}
/>

					{/* Project Lists */}
					{listForTable?.map((list: List) => {
						const listTasks = listTasksMap[list.id] ?? EMPTY_ARRAY;

						return (
							<div key={list.id} className="flex flex-col gap-2">
								<Input value={list.name} readOnly />
<DataTable
  data={listTasks}
  columns={columns}
  state={tableState}
  getRowId={getRowId}
  getChildren={getChildren}
  onExpand={handleExpand}
  onToggleExpand={handleToggleExpand}
  onMove={handleMove}
  onRowClick={handleRowClick}
  onSortingChange={handleSortingChange}
  onPaginationChange={handlePaginationChange}
  onColumnResize={handleColumnResize}
/>
							</div>
						);
					})}
				</div>
			)}
			<AddTaskDialog
				showTaskDialog={showTaskDialog}
				setShowTaskDialog={(open) => { if (!open) closeTaskDialog(); }}
				taskData={selectedTaskForDialog}
				setTaskForTableState={setTaskForTableState}
				type={taskDialogType}
			/>
			<DrawerInfo
				open={taskOpen}
				task={taskData}
				setTask={setTaskData}
				setOpen={setTaskOpen}
				userId={auth.user?.id}
				taskId={taskData?.id}
				setTaskForTableState={setTaskForTableState}
				onSubTaskClick={handleSubTaskClick}
				subTask={subTask}
				setSubTask={setSubTask}
				subTaskOpen={subTaskOpen}
				setSubTaskOpen={setSubTaskOpen}
				parentId={null}
				statuses={statuses}
				setShowTaskDelete={setShowTaskDelete}
				createTask={createTask}
			/>

			<DeleteTaskDialog
				showTaskDelete={showTaskDelete}
				setShowTaskDelete={setShowTaskDelete}
				taskData={taskData}
				setTaskData={setTaskData}
				setTaskForTableState={setTaskForTableState}
				setTaskOpen={setTaskOpen}
			/>
		</div>
	);
}
