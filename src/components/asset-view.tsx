import { useState } from "react";
import { X } from "lucide-react";
import { useDeleteUploadedMedia } from "@/lib/api/upload";
import { type Asset, AssetType } from "@/types/type";

interface Props {
	assets: Asset[];
	onDelete?: (publicId: string) => void;
}

export const AssetGrid = ({ assets, onDelete }: Props) => {
	const [selected, setSelected] = useState<Asset | null>(null);
	const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
	const deleteAsset = useDeleteUploadedMedia();

	const handleDelete = async () => {
		if (!confirmDelete || !confirmDelete?.publicId) return;
		try {
			await deleteAsset.mutateAsync(confirmDelete?.publicId);
			onDelete?.(confirmDelete.publicId);
		} catch (err) {
			console.error("Failed to delete asset", err);
		} finally {
			setConfirmDelete(null);
		}
	};

	return (
		<>
			{/* GRID */}
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 m-4 0">
				{assets.map((asset) => (
					<div
						key={asset.publicId}
						onClick={() => setSelected(asset)}
						className="cursor-pointer rounded-lg overflow-hidden border hover:shadow-md transition relative group"
					>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setConfirmDelete(asset);
							}}
							className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition z-10 hover:bg-red-600"
						>
							<X className="h-4 w-4" />
						</button>

						{asset.type === AssetType.IMAGE && (
							<img
								src={asset.url}
								alt=""
								className="w-full h-32 object-cover"
							/>
						)}

						{asset.type === AssetType.VIDEO && (
							<div className="relative">
								<video
									src={asset.url}
									className="w-full h-32 object-cover"
									muted
								/>
								<span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-sm">
									▶
								</span>
							</div>
						)}

						{asset.type === AssetType.FILE && (
							<div className="h-32 flex items-center justify-center bg-gray-100 text-sm font-medium">
								📄 File
							</div>
						)}
					</div>
				))}
			</div>

			{/* DELETE CONFIRMATION */}
			{confirmDelete && (
				<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
					<div className="bg-slate-900 text-white rounded-lg p-6 max-w-sm w-full mx-4">
						<h3 className="text-lg font-semibold mb-2">Delete Asset?</h3>
						<p className="text-slate-400 mb-6 text-sm">
							Are you sure you want to delete this asset? This action cannot be undone.
						</p>
						<div className="flex gap-3 justify-end">
							<button
								onClick={() => setConfirmDelete(null)}
								className="px-4 py-2 rounded border border-slate-600 hover:bg-slate-800 text-sm"
							>
								Cancel
							</button>
							<button
								onClick={handleDelete}
								disabled={deleteAsset.isPending}
								className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-sm disabled:opacity-50"
							>
								{deleteAsset.isPending ? "Deleting..." : "Delete"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* MODAL */}
			{selected && (
				<AssetModal asset={selected} onClose={() => setSelected(null)} />
			)}
		</>
	);
};

interface ModalProps {
	asset: Asset;
	onClose: () => void;
}

const AssetModal = ({ asset, onClose }: ModalProps) => {
	return (
		<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
			<div className="relative bg-white rounded-lg max-w-5xl w-full p-4">
				<button
					onClick={onClose}
					className="absolute top-2 right-2 text-black text-xl"
				>
					✕
				</button>

				{asset.type === AssetType.IMAGE && (
					<img
						src={asset.url}
						alt=""
						className="w-full max-h-[80vh] object-contain"
					/>
				)}

				{asset.type === AssetType.VIDEO && (
					<video
						src={asset.url}
						controls
						autoPlay
						className="w-full max-h-[80vh]"
					/>
				)}

				{asset.type === AssetType.FILE && (
					<a
						href={asset.url}
						target="_blank"
						className="text-blue-600 underline"
						rel="noopener"
					>
						Open file
					</a>
				)}
			</div>
		</div>
	);
};
