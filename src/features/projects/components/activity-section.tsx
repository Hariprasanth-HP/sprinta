import { Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	useCreateactivity,
	useUpdateactivity,
} from "@/features/projects/api/activity";
import { useUploadMedia } from "@/lib/api/upload";
import { PageNav } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/usePagination";
import type { Activity } from "@/types/type";
import RichTextEditor from "@/components/editor/rich-text-editor";

const EMPTY_LEXICAL_STATE =
	'{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

function isContentEmpty(json: string): boolean {
	try {
		const state = JSON.parse(json);
		const children = state?.root?.children ?? [];
		if (children.length === 0) return true;
		return children.every(
			(child: { children?: unknown[]; type?: string }) =>
				child.type === "paragraph" &&
				(!child.children || child.children.length === 0),
		);
	} catch {
		return true;
	}
}

export default function ActivityComp({
	userId,
	taskId,
	parentId,
	activities,
	setActivities,
}: {
	userId?: string;
	taskId?: number;
	parentId?: string;
	activities?: Activity[];
	setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
}) {
	const createActivity = useCreateactivity();
	const updateActivity = useUpdateactivity();
	const { mutateAsync: uploadMedia } = useUploadMedia();
	const [content, setContent] = useState(EMPTY_LEXICAL_STATE);
	const [uploading, setUploading] = useState(false);
	const [editContent, setEditContent] = useState(EMPTY_LEXICAL_STATE);
	const [editUploading, setEditUploading] = useState(false);
	const [contentError, setContentError] = useState("");
	const [editContentError, setEditContentError] = useState("");
	const [editActivity, setEditActivity] = useState<Activity | undefined>();
	const [showActivityDialog, setShowActivityDialog] = useState(false);
	const {
		paginatedData: paginatedActivities,
		page,
		totalPages,
		nextPage,
		prevPage,
		canNextPage,
		canPrevPage,
		reset: resetPage,
	} = usePagination({ data: activities ?? [], pageSize: 10 });

	const uploadFile = async (file: File): Promise<string> => {
		const { data } = await uploadMedia({ files: [file], taskId: taskId! });
		return data?.[0]?.url ?? "";
	};

	const handleCreateActivity = async () => {
		try {
			if (isContentEmpty(content)) {
				setContentError("Activity description cannot be empty.");
				return;
			}
			setContentError("");
			setUploading(true);

			const { data } = await createActivity.mutateAsync({
				description: content,
				userId: userId!,
				taskId: taskId!,
				parentId: parentId,
				kind: "COMMENT",
				assetIds: [],
			});
			if (data) {
				setActivities?.([data, ...(activities || [])]);
				setContent(EMPTY_LEXICAL_STATE);
				resetPage();
			}
		} catch (error) {
			toast.error("Failed to create activity");
			void error;
		} finally {
			setUploading(false);
		}
	};

	const handleUpdateActivity = async () => {
		try {
			if (isContentEmpty(editContent)) {
				setEditContentError("Comment cannot be empty.");
				return;
			}
			setEditContentError("");
			setEditUploading(true);

			const { data } = await updateActivity.mutateAsync({
				id: editActivity?.id,
				description: editContent,
				assetIds: [],
			});
			if (data) {
				setActivities?.((prev: Activity[]) =>
					prev.map((act) => (act.id === data.id ? data : act)),
				);
				setEditContent(EMPTY_LEXICAL_STATE);
				setShowActivityDialog(false);
			}
		} catch (error) {
			toast.error("Failed to update activity");
			void error;
		} finally {
			setEditUploading(false);
		}
	};

	return (
		<div className="mx-auto max-w-2xl space-y-8 py-8 h-[100%]">
			<div className="space-y-4">
				<h2 className="text-2xl font-bold">Activities</h2>
				<div className="w-full space-y-2">
					<RichTextEditor
						value={content}
						onChange={setContent}
						placeholder="Write your activity... (drag & drop images/videos here)"
						uploadFile={uploadFile}
					/>
					{contentError && (
						<p className="text-sm text-destructive">{contentError}</p>
					)}
					<div className="flex justify-end">
						<Button
							onClick={handleCreateActivity}
							disabled={isContentEmpty(content) || uploading}
						>
							{uploading ? "Saving..." : "Submit"}
						</Button>
					</div>
				</div>
			</div>
			<div className="space-y-6 overflow-auto h-[80%]">
				{(paginatedActivities ?? []).length > 0 ? (
					(paginatedActivities ?? []).map((activity) => (
						<div key={activity.id} className="flex items-start gap-4">
							<Avatar className="h-10 w-10 border">
								<AvatarImage
									src="/placeholder-user.jpg"
									alt={activity?.user?.email}
								/>
								<AvatarFallback>
									{activity?.user?.name?.charAt(0)}
								</AvatarFallback>
							</Avatar>

							<div className="grid gap-1.5 w-full">
								<div className="flex items-center gap-2 w-full">
									<div className="font-medium">{activity?.user?.name}</div>
									<div className="text-xs text-muted-foreground">
										{new Date(activity.createdAt).toLocaleDateString()}
									</div>
									{activity.kind === "COMMENT" && (
										<Button
											variant="ghost"
											size="sm"
											onClick={() => {
												setEditActivity(activity);
												setEditContent(activity.description!);
												setShowActivityDialog(true);
											}}
											className="ml-auto"
										>
											<Edit className="h-4 w-4" />
										</Button>
									)}
								</div>

								{activity.description && (
									<RichTextEditor
										value={activity.description}
										editable={false}
									/>
								)}
							</div>
						</div>
					))
				) : (
					<p className="text-sm text-muted-foreground">No activities yet.</p>
				)}
				<PageNav
					page={page}
					totalPages={totalPages}
					onPrev={prevPage}
					onNext={nextPage}
					canPrev={canPrevPage}
					canNext={canNextPage}
				/>
			</div>
			<Dialog
				open={showActivityDialog}
				onOpenChange={setShowActivityDialog}
			>
				<DialogContent className="sm:max-w-[40%] overflow-auto">
					<DialogHeader>
						<DialogTitle>Edit Comment</DialogTitle>
					</DialogHeader>
					<div className="w-full space-y-2">
						<RichTextEditor
							value={editContent}
							onChange={setEditContent}
							placeholder="Write your activity... (drag & drop images/videos here)"
							uploadFile={uploadFile}
						/>
						{editContentError && (
							<p className="text-sm text-destructive">{editContentError}</p>
						)}
						<div className="flex justify-end">
							<Button
								onClick={handleUpdateActivity}
								disabled={
									isContentEmpty(editContent) ||
									editUploading ||
									updateActivity.isPending
								}
							>
								{editUploading || updateActivity.isPending
									? "Saving..."
									: "Update"}
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
