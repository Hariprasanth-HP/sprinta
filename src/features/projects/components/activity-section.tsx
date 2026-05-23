import { Edit, FileText, Image, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
	useCreateactivity,
	useUpdateactivity,
} from "@/features/projects/api/activity";
import { useUploadMedia } from "@/lib/api/upload";
import type { Activity, Asset } from "@/types/type";

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
	const [description, setDescription] = useState("");
	const [files, setFiles] = useState<File[]>([]);
	const [uploading, setUploading] = useState(false);
	const [editDesc, setEditDesc] = useState("");
	const [descriptionError, setDescriptionError] = useState("");
	const [editDescriptionError, setEditDescriptionError] = useState("");
	const [editActivity, setEditActivity] = useState<Activity | undefined>();
	const [showActivityDialog, setShowActivityDialog] = useState(false);
	const filePickerRef = useRef<HTMLInputElement>(null);

	const handleCreateActivity = async () => {
		try {
			if (!description.trim()) {
				setDescriptionError("Activity description cannot be empty.");
				return;
			}
			setDescriptionError("");
			setUploading(true);

			let assetIds: number[] = [];
			if (files.length) {
				const { data } = await uploadMedia({ files, taskId: taskId! });
				assetIds = data?.map((a: Asset) => a.id!).filter(Boolean) ?? [];
			}

			const { data } = await createActivity.mutateAsync({
				description,
				userId: userId!,
				taskId: taskId!,
				parentId: parentId,
				kind: "COMMENT",
				assetIds,
			});
			if (data) {
				setActivities?.([data, ...(activities || [])]);
				setDescription("");
				setFiles([]);
			}
		} catch (error) {
			toast.error("Failed to create activity");
			void error;
		} finally {
			setUploading(false);
		}
	};

	const [editFiles, setEditFiles] = useState<File[]>([]);
	const [editUploading, setEditUploading] = useState(false);
	const editFilePickerRef = useRef<HTMLInputElement>(null);

	const handleUpdateActivity = async () => {
		try {
			if (!editDesc.trim()) {
				setEditDescriptionError("Comment cannot be empty.");
				return;
			}
			setEditDescriptionError("");
			setEditUploading(true);

			let assetIds: number[] = [];
			if (editFiles.length && taskId) {
				const { data } = await uploadMedia({
					files: editFiles,
					taskId,
				});
				assetIds = data?.map((a: Asset) => a.id!).filter(Boolean) ?? [];
			}

			const { data } = await updateActivity.mutateAsync({
				id: editActivity?.id,
				description: editDesc,
				assetIds,
			});
			if (data) {
				setActivities?.((prev: Activity[]) =>
					prev.map((act) => (act.id === data.id ? data : act)),
				);
				setEditDesc("");
				setEditFiles([]);
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
				<CommentForm
					description={description}
					setDescription={setDescription}
					descriptionError={descriptionError}
					files={files}
					setFiles={setFiles}
					filePickerRef={filePickerRef}
					onSubmit={handleCreateActivity}
					loading={uploading}
				/>
			</div>
			<div className="space-y-6 overflow-auto h-[80%]">
				{activities && activities.length > 0 ? (
					activities.map((activity) => (
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
												setEditDesc(activity.description!);
												setShowActivityDialog(true);
											}}
											className="ml-auto"
										>
											<Edit className="h-4 w-4" />
										</Button>
									)}
								</div>

								<div className="text-sm text-muted-foreground">
									{activity.description}
								</div>

								{activity.assets && activity.assets.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-1">
										{activity.assets.map((asset) => (
											<ActivityAsset key={asset.id} asset={asset} />
										))}
									</div>
								)}
							</div>
						</div>
					))
				) : (
					<p className="text-sm text-muted-foreground">No activities yet.</p>
				)}
			</div>
			<Dialog
				open={showActivityDialog}
				onOpenChange={(open) => {
					if (!open) {
						setEditFiles([]);
					}
					setShowActivityDialog(open);
				}}
			>
				<DialogContent className="sm:max-w-[40%] overflow-auto">
					<DialogHeader>
						<DialogTitle>Edit Comment</DialogTitle>
					</DialogHeader>
					<CommentForm
						description={editDesc}
						setDescription={setEditDesc}
						descriptionError={editDescriptionError}
						files={editFiles}
						setFiles={setEditFiles}
						filePickerRef={editFilePickerRef}
						onSubmit={handleUpdateActivity}
						submitLabel="Update"
						loading={editUploading || updateActivity.isPending}
					/>
					{editActivity?.assets && editActivity.assets.length > 0 && (
						<div className="space-y-2">
							<p className="text-xs text-muted-foreground font-medium">
								Attached media
							</p>
							<div className="flex flex-wrap gap-2">
								{editActivity.assets.map((asset) => (
									<ActivityAsset key={asset.id} asset={asset} />
								))}
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
}

function ActivityAsset({ asset }: { asset: Asset }) {
	const isImage = asset.type === "IMAGE";
	const [open, setOpen] = useState(false);
	const [thumbnailError, setThumbnailError] = useState(false);
	const [fullError, setFullError] = useState(false);

	if (isImage) {
		return (
			<>
				<button type="button" onClick={() => !thumbnailError && setOpen(true)}>
					{thumbnailError ? (
						<div className="h-24 w-24 rounded-md border bg-muted flex items-center justify-center text-muted-foreground">
							<Image className="h-6 w-6" />
						</div>
					) : (
						<img
							src={asset.url}
							alt=""
							onError={() => setThumbnailError(true)}
							className="h-24 w-24 rounded-md object-cover border hover:opacity-80 transition-opacity"
						/>
					)}
				</button>
				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="sm:max-w-[60%]">
						{fullError ? (
							<div className="w-full h-48 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
								<Image className="h-8 w-8" />
							</div>
						) : (
							<img
								src={asset.url}
								alt=""
								onError={() => setFullError(true)}
								className="w-full h-auto rounded-md"
							/>
						)}
					</DialogContent>
				</Dialog>
			</>
		);
	}

	if (asset.type === "VIDEO") {
		return (
			<video
				src={asset.url}
				controls
				className="w-full max-w-[320px] min-h-[120px] h-auto rounded-md border bg-muted"
			/>
		);
	}

	return (
		<a
			href={asset.url}
			target="_blank"
			rel="noreferrer"
			className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border rounded-md px-2 py-1"
		>
			<FileText className="h-3 w-3" />
			File
		</a>
	);
}

interface CommentFormProps {
	description: string;
	setDescription: (v: string) => void;
	descriptionError?: string | null;
	files?: File[];
	setFiles?: (v: File[]) => void;
	filePickerRef?: React.RefObject<HTMLInputElement | null>;
	onSubmit: () => void;
	submitLabel?: string;
	loading?: boolean;
}

export function CommentForm({
	description,
	setDescription,
	descriptionError,
	files,
	setFiles,
	filePickerRef,
	onSubmit,
	submitLabel = "Submit",
	loading = false,
}: CommentFormProps) {
	return (
		<div className="w-full space-y-2">
			<div className="grid h-full gap-2">
				<Textarea
					name="description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Write your activity..."
					className="resize-none rounded-md border border-input bg-background p-3 text-sm shadow-sm"
				/>
				{descriptionError && (
					<p className="text-sm text-destructive">{descriptionError}</p>
				)}

				{files !== undefined && setFiles && filePickerRef && (
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => filePickerRef.current?.click()}
						>
							<Upload className="h-3 w-3 mr-1" />
							Attach
						</Button>
						<input
							ref={filePickerRef}
							type="file"
							accept="image/png,image/jpeg,image/gif,video/mp4"
							multiple
							className="hidden"
							onChange={(e) => {
								const selected = e.target.files
									? Array.from(e.target.files)
									: [];
								setFiles([...files, ...selected]);
								e.target.value = "";
							}}
						/>
						{files.map((f, i) => (
							<Card
								key={`${f.name}-${i}`}
								className="flex items-center gap-1 px-2 py-1 text-xs"
							>
								{f.type.startsWith("image/") ? (
									<Image className="h-3 w-3" />
								) : (
									<FileText className="h-3 w-3" />
								)}
								<span className="truncate max-w-[120px]">{f.name}</span>
								<button
									type="button"
									onClick={() => setFiles(files.filter((_, j) => j !== i))}
								>
									<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
								</button>
							</Card>
						))}
					</div>
				)}
			</div>

			<div className="flex justify-end">
				<Button onClick={onSubmit} disabled={loading}>
					{loading ? "Saving..." : submitLabel}
				</Button>
			</div>
		</div>
	);
}
