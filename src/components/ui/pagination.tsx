import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageNavProps {
	page: number;
	totalPages: number;
	onPrev: () => void;
	onNext: () => void;
	canPrev: boolean;
	canNext: boolean;
}

export function PageNav({
	page,
	totalPages,
	onPrev,
	onNext,
	canPrev,
	canNext,
}: PageNavProps) {
	if (totalPages <= 1) return null;
	return (
		<div className="flex items-center justify-center gap-2 pt-4">
			<Button variant="outline" size="sm" disabled={!canPrev} onClick={onPrev}>
				<ChevronLeft className="h-4 w-4" />
			</Button>
			<span className="text-sm text-muted-foreground">
				Page {page} of {totalPages}
			</span>
			<Button variant="outline" size="sm" disabled={!canNext} onClick={onNext}>
				<ChevronRight className="h-4 w-4" />
			</Button>
		</div>
	);
}

interface LoadMoreProps {
	onLoadMore: () => void;
	loading?: boolean;
	hasMore: boolean;
	label?: string;
}

export function LoadMore({
	onLoadMore,
	loading = false,
	hasMore,
	label = "Load more",
}: LoadMoreProps) {
	if (!hasMore) return null;
	return (
		<div className="flex items-center justify-center pt-4">
			<Button
				variant="outline"
				size="sm"
				disabled={loading}
				onClick={onLoadMore}
			>
				{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
				{label}
			</Button>
		</div>
	);
}
