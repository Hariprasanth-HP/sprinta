import {
  DndContext,
  type DragEndEvent,
  type DragStartEvent,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  pointerWithin,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import * as React from "react";

import { Button } from "../../../components/ui/button";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

export type TableState = {
  sorting?: SortingState;
  columnWidths: Record<string, number>;
  expandedRows: Record<string, boolean>;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
};

function DraggableRow<T extends { id: string | number }>({
  row,
  overId,
  onRowClick,
}: {
  row: Row<T>;
  overId: string | null;
  onRowClick?: (_: unknown, row: Row<T>) => void;
}) {
  const { transform, transition, setNodeRef, isDragging, listeners, attributes } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      data-depth={row.depth}
      data-over={overId === String(row.original.id) ? "true" : undefined}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-0"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition ?? "transform 200ms ease",
      }}
      onClick={(e) => {
        onRowClick?.(e, row);
      }}
      {...attributes}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {cell.column.id === "drag" ? (
            <span {...listeners} className="cursor-grab active:cursor-grabbing inline-flex">
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          ) : (
            flexRender(cell.column.columnDef.cell, cell.getContext())
          )}
        </TableCell>
      ))}
    </TableRow>
  );
}

type Parentable = {
  id: string | number;
};

export function DataTable<T extends Parentable>({
  data,
  columns,
  state,
  getRowId,
  getChildren,
  onExpand,
  onToggleExpand,
  onMove,
  onRowClick,
  onSortingChange: onSortingChangeProp,
  onPaginationChange: onPaginationChangeProp,
  onColumnResize,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  state: TableState;
  getRowId: (row: T) => string | number;
  getChildren: (row: T) => T[];
  onExpand?: (row: T) => Promise<void> | void;
  onToggleExpand?: (rowId: string) => void;
  onMove?: (sourceId: string | number, targetId: string | number, position: "before" | "after" | "inside") => void;
  onRowClick?: (_: unknown, row: Row<T>) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onPaginationChange?: (pagination: { pageIndex: number; pageSize: number }) => void;
  onColumnResize?: (sizing: Record<string, number>) => void;
}) {
  const { sorting, pagination } = state;
  const { pageIndex, pageSize } = pagination;

  // Store callbacks in refs to avoid useMemo/useReactTable re-computation
  const getRowIdRef = React.useRef(getRowId);
  getRowIdRef.current = getRowId;
  const getChildrenRef = React.useRef(getChildren);
  getChildrenRef.current = getChildren;
  const onExpandRef = React.useRef(onExpand);
  onExpandRef.current = onExpand;
  const onToggleExpandRef = React.useRef(onToggleExpand);
  onToggleExpandRef.current = onToggleExpand;
  const onMoveRef = React.useRef(onMove);
  onMoveRef.current = onMove;
  const onRowClickRef = React.useRef(onRowClick);
  onRowClickRef.current = onRowClick;
  const onSortingChangeRef = React.useRef(onSortingChangeProp);
  onSortingChangeRef.current = onSortingChangeProp;
  const onPaginationChangeRef = React.useRef(onPaginationChangeProp);
  onPaginationChangeRef.current = onPaginationChangeProp;
  const onColumnResizeRef = React.useRef(onColumnResize);
  onColumnResizeRef.current = onColumnResize;

  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnSizing, setColumnSizing] = React.useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  // Stable ID generator using ref
  const stableGetRowId = React.useCallback(
    (item: T) => String(getRowIdRef.current(item)),
    [],
  );

  // Stable column definitions – only depends on `columns` from parent
  const columnsWithExpander = React.useMemo<ColumnDef<T>[]>(() => {
    const expanderCol: ColumnDef<T> = {
      id: "expander",
      header: () => null,
      cell: ({ row }) => {
        const children = getChildrenRef.current(row.original);
        const rowId = String(getRowIdRef.current(row.original));
        const isExpanded = row.getIsExpanded();
        const toggleHandler = onToggleExpandRef.current;
        const expandHandler = onExpandRef.current;

        return children.length > 0 ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleHandler?.(rowId);
              if (!isExpanded && expandHandler) {
                expandHandler(row.original);
              }
            }}
            className="p-0"
          >
            <IconChevronDown className={`transition-transform duration-[2000ms] ${isExpanded ? "rotate-0" : "-rotate-90"}`} />
          </Button>
        ) : null;
      },
      size: 32,
      enableResizing: false,
    };
    const result = [...columns];
    result.splice(1, 0, expanderCol);
    return result;
    // Intentionally only depend on columns – callbacks are read from refs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
    setOverId(null);
  }

  function handleDragOver(event: any) {
    setOverId(event.over ? String(event.over.id) : null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    setOverId(null);
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;
    onMoveRef.current?.(active.id, over.id, "after");
  }

  // Stable getSubRows via ref
  const getSubRows = React.useCallback(
    (row: T) => getChildrenRef.current(row) as unknown as T[],
    [],
  );

  const onSortingChange = React.useCallback(
    (updater: any) => {
      const newSorting =
        typeof updater === "function" ? updater(sorting ?? []) : updater;
      onSortingChangeRef.current?.(newSorting);
    },
    [sorting],
  );

  const onPaginationChange = React.useCallback(
    (updater: any) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      onPaginationChangeRef.current?.({
        pageIndex: newPagination.pageIndex,
        pageSize: newPagination.pageSize,
      });
    },
    [pageIndex, pageSize],
  );

  const tableState = React.useMemo(
    () => ({
      sorting: sorting ?? [],
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: { pageIndex, pageSize: Math.max(1, pageSize) },
      columnSizing,
      expanded: state.expandedRows,
    }),
    [
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pageIndex,
      pageSize,
      columnSizing,
      state.expandedRows,
    ],
  );

  const table = useReactTable<T>({
    data,
    columns: columnsWithExpander,
    state: tableState,
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    onColumnSizingChange: (sizing) => {
      const resolved = typeof sizing === "function" ? sizing(columnSizing) : sizing;
      setColumnSizing(resolved);
      onColumnResizeRef.current?.(resolved);
    },
    getRowId: stableGetRowId,
    getSubRows,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => table.getRowModel().rows.map((r) => r.id),
    [table],
  );

  const activeRow = React.useMemo(
    () => (activeId ? table.getRowModel().rows.find((r) => r.id === activeId) : null),
    [activeId, table],
  );

  return (
    <div className="flex flex-col gap-4">
      <style>{`
        .scrollbar-white::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-white::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-white::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.5); border-radius: 3px; }
        .scrollbar-white::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.7); }
        .scroll-container [data-slot="table-container"] { overflow: visible !important; }
        tr[data-over="true"] { background-color: color-mix(in srgb, var(--primary) 10%, transparent); }
      `}</style>
      <div
        className="max-h-[400px] overflow-auto rounded-lg border scrollbar-white scroll-container"
        style={{ scrollbarColor: "white transparent", scrollbarWidth: "thin" as const }}
      >
        <DndContext
          collisionDetection={pointerWithin}
          modifiers={[restrictToVerticalAxis]}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table className="table-fixed">
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{ width: header.getSize() }}
                      className="relative"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanResize() && (
                        <div
                          onMouseDown={header.getResizeHandler()}
                          onTouchStart={header.getResizeHandler()}
                          className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-sky-500 select-none"
                        />
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows.length > 0 ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row as unknown as Row<T>}
                      overId={overId}
                      onRowClick={onRowClickRef.current}
                    />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell colSpan={columnsWithExpander.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <DragOverlay>
            {activeRow ? (
              <div
                className="flex items-center bg-background border rounded-lg shadow-xl opacity-95 px-4 py-2"
                style={{ width: `${table.getTotalSize()}px`, gap: "inherit" }}
              >
                {activeRow.getVisibleCells().map((cell) => {
                  const size = cell.column.getSize();
                  return (
                    <div
                      key={cell.id}
                      style={{ width: size, minWidth: size, flexShrink: 0 }}
                      className="px-2"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  );
                })}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <div className="flex items-center justify-between px-4">
        <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label htmlFor="rows-per-page" className="text-sm font-medium">
              Rows per page
            </Label>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <IconChevronsLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <IconChevronLeft />
            </Button>
            <Button
              variant="outline"
              className="size-8"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <IconChevronRight />
            </Button>
            <Button
              variant="outline"
              className="hidden size-8 lg:flex"
              size="icon"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <IconChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
