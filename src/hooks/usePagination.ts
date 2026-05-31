import { useCallback, useMemo, useState } from "react";

type UsePaginationOptions<T> = {
	data?: T[];
	pageSize?: number;
	totalPages?: number;
};

export function usePagination<T>(options?: UsePaginationOptions<T>) {
	const pageSize = options?.pageSize ?? 10;
	const [page, setPageState] = useState(1);

	const dataLength = options?.data?.length ?? 0;
	const hasData = !!options?.data;

	const totalPages = options?.totalPages ?? Math.max(1, Math.ceil(dataLength / pageSize));

	const paginatedData = useMemo(
		() =>
			hasData
				? (options.data ?? []).slice(
						(page - 1) * pageSize,
						page * pageSize,
					)
				: undefined,
		[options?.data, page, pageSize, hasData],
	);

	const setPage = useCallback((n: number) => {
		setPageState(Math.max(1, n));
	}, []);

	const nextPage = useCallback(() => {
		setPageState((p) => Math.min(totalPages, p + 1));
	}, [totalPages]);

	const prevPage = useCallback(() => {
		setPageState((p) => Math.max(1, p - 1));
	}, []);

	const goToPage = useCallback(
		(n: number) => {
			setPageState(Math.max(1, Math.min(totalPages, n)));
		},
		[totalPages],
	);

	const reset = useCallback(() => {
		setPageState(1);
	}, []);

	return {
		page,
		pageSize,
		totalPages,
		paginatedData,
		hasMore: page < totalPages,
		canNextPage: page < totalPages,
		canPrevPage: page > 1,
		setPage,
		nextPage,
		prevPage,
		goToPage,
		reset,
	};
}
