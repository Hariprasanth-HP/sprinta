import { useMutation } from "@tanstack/react-query";
import { apiDelete, apiGet, apiPost } from "@/lib/apiClient";
import type { Asset } from "@/types/type";

export type UploadMediaRes = {
	success: boolean;
	count: number;
	data: Asset[];
};

export async function uploadFilesApi(
	files: File[],
	taskId: number,
) {
	const formData = new FormData();
	files.forEach((file) => {
		formData.append("files", file);
	});

	return apiPost<UploadMediaRes>(
		`/upload/multiple?taskId=${taskId}`,
		formData,
		{ isFormData: true },
	);
}

export async function deleteUploadedMediaApi(publicId: string) {
	return apiDelete<{ success: boolean }>(`/upload/${publicId}`);
}

export async function getUploadedMediaApi(taskId: number) {
	return apiGet<UploadMediaRes>(`/upload?taskId=${taskId}`);
}

export function useUploadMedia() {
	return useMutation({
		mutationFn: ({
			files,
			taskId,
		}: {
			files: File[];
			taskId: number;
		}) => uploadFilesApi(files, taskId),
	});
}

export function useDeleteUploadedMedia() {
	return useMutation({
		mutationFn: (publicId: string) => deleteUploadedMediaApi(publicId),
	});
}

export function useGetUploadedMedia(taskId: number) {
	return useMutation({
		mutationFn: () => getUploadedMediaApi(taskId),
	});
}