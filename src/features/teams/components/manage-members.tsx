"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageNav } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { usePagination } from "@/hooks/usePagination";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDeleteMember, useFetchMembersForTeam, useUpdateMember } from "@/features/teams/api/member";
import type { TeamMember } from "@/types/type";
import { useAppSelector } from "@/hooks/useAuth";
import { TeamRole } from "@/components/nav-team";

type ManageMembersProps = {
	teamId: number;
};

export function ManageMembers({ teamId }: ManageMembersProps) {
	const { data = [] } = useFetchMembersForTeam(teamId);
	return <TeamMembersList key={"members-list"} initialMembers={data} />;
}

type Props = {
	initialMembers?: TeamMember[];
	onDeleted?: (memberId: number) => void;
};

export default function TeamMembersList({ initialMembers = [] }: Props) {
	const [members, setMembers] = useState<TeamMember[]>(initialMembers);
	const user = useAppSelector((state) => state.auth.user);
	const userData = members.find((member) => member.userId === user?.id);
	const isAdminOrOwner = userData?.role === TeamRole.ADMIN || userData?.role === TeamRole.OWNER;

	const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});

	const [editMember, setEditMember] = useState<TeamMember | null>(null);
	const [editRole, setEditRole] = useState<string>("");
	const [editLoading, setEditLoading] = useState(false);

	const deleteMember = useDeleteMember();
	const updateMember = useUpdateMember();

	useEffect(() => {
		setMembers(initialMembers);
	}, [initialMembers]);

	const {
		paginatedData: paginatedMembers,
		page,
		totalPages,
		nextPage,
		prevPage,
		canNextPage,
		canPrevPage,
	} = usePagination({ data: members ?? [], pageSize: 10 });

	async function handleDelete(member: TeamMember) {
		const confirmMsg = `Remove ${member.name ?? member.email}?`;
		if (!confirm(confirmMsg)) return;
		setLoadingIds((s) => ({ ...s, [member.id]: true }));

		const prev = members;
		setMembers((m) => m.filter((x) => x.id !== member.id));
		try {
			await deleteMember.mutateAsync({ memberId: member.id });
			toast.success("Member deleted");

		} catch (e: unknown) {
			setMembers(prev);
			toast.error(e instanceof Error ? e?.message : "Failed to delete member");

		} finally {
			setLoadingIds((s) => {
				const copy = { ...s };
				delete copy[member.id];
				return copy;
			});
		}
	}

	function handleEditClick(member: TeamMember) {
		setEditMember(member);
		setEditRole(member.role ?? "MEMBER");
	}

	function handleSaveRole() {
		if (!editMember || editRole === editMember.role) return;
		setEditLoading(true);
		updateMember.mutate(
			{ memberId: editMember.id, role: editRole },
			{
				onSuccess: () => {
					setMembers((prev) =>
						prev.map((m) =>
							m.id === editMember.id ? { ...m, role: editRole } : m,
						),
					);
					toast.success("Role updated");
					setEditMember(null);
				},
				onError: (e) => {
					toast.error(e?.message ?? "Failed to update role");
				},
				onSettled: () => {
					setEditLoading(false);
				},
			},
		);
	}

	if (members.length === 0) {
		return <div className="p-6 text-sm text-muted-foreground">No members found.</div>;
	}

	return (
		<>
			{members.length === 0 ? (
				<div className="text-center py-12 text-muted-foreground">
					<p className="text-sm">No members in this team yet.</p>
					<p className="text-xs mt-1">Invite members using the Add Members tab.</p>
				</div>
			) : (
				<div className="space-y-3">
					{(paginatedMembers ?? []).map((m) => (
						<div
							key={m.id}
							className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-card rounded-xl border hover:border-slate-600 transition-colors"
						>
							<div className="flex items-center gap-3 min-w-0 flex-1">
								<div
									className={clsx(
										"flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
										m.userId
											? "bg-sky-600 text-white"
											: "bg-muted text-muted-foreground",
									)}
								>
									{(m.name || m.email)
										.split(" ")
										.map((s) => s[0])
										.slice(0, 2)
										.join("")
										.toUpperCase()}
								</div>

								<div className="min-w-0 flex-1">
									<p className="font-medium truncate">{m.name ?? "Unnamed"}</p>
									<p className="text-xs text-muted-foreground truncate">{m.email}</p>
								</div>

								<span className={clsx(
									"px-2 py-0.5 rounded-full text-xs font-medium shrink-0 hidden sm:inline-block",
									m.role === "OWNER" && "bg-purple-500/20 text-purple-400",
									m.role === "ADMIN" && "bg-blue-500/20 text-blue-400",
									m.role === "MEMBER" && "bg-green-500/20 text-green-400",
								)}>
									{m.role}
								</span>
							</div>

							<div className="flex items-center justify-between sm:justify-end gap-2 pl-13 sm:pl-0">
								<span className={clsx(
									"px-2 py-0.5 rounded-full text-xs font-medium sm:hidden",
									m.role === "OWNER" && "bg-purple-500/20 text-purple-400",
									m.role === "ADMIN" && "bg-blue-500/20 text-blue-400",
									m.role === "MEMBER" && "bg-green-500/20 text-green-400",
								)}>
									{m.role}
								</span>

								{isAdminOrOwner && (
									<div className="flex items-center gap-1">
										<Button
											variant="ghost"
											size="sm"
											className="text-xs h-7 px-2"
											onClick={() => handleEditClick(m)}
											disabled={Boolean(loadingIds[m.id])}
											title={`Edit role for ${m.name ?? m.email}`}
										>
											Edit
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-destructive hover:bg-destructive/10"
											onClick={() => handleDelete(m)}
											disabled={Boolean(loadingIds[m.id])}
											title={`Remove ${m.name ?? m.email}`}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}
			<PageNav
				page={page}
				totalPages={totalPages}
				onPrev={prevPage}
				onNext={nextPage}
				canPrev={canPrevPage}
				canNext={canNextPage}
			/>

			<Dialog open={!!editMember} onOpenChange={(open) => !open && setEditMember(null)}>
				<DialogContent className="sm:max-w-[400px] overflow-auto">
					<DialogHeader>
						<DialogTitle>Edit Role</DialogTitle>
						<DialogDescription>
							Change the role for {editMember?.name ?? editMember?.email}
						</DialogDescription>
					</DialogHeader>

					<div className="py-4">
						<Select value={editRole} onValueChange={setEditRole}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="OWNER">Owner</SelectItem>
								<SelectItem value="ADMIN">Admin</SelectItem>
								<SelectItem value="MEMBER">Member</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditMember(null)}
						>
							Cancel
						</Button>
						<Button
							disabled={editRole === editMember?.role || editLoading}
							onClick={handleSaveRole}
						>
							{editLoading ? "Saving..." : "Save"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}