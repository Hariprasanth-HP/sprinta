"use client";

import clsx from "clsx";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
	const userData = members.find((member) => member.userId === user?.id)
	const isAdminOrOwner = userData?.role === TeamRole.ADMIN || userData?.role === TeamRole.OWNER
	console.log('useruser', initialMembers, user, isAdminOrOwner);

	const [loadingIds, setLoadingIds] = useState<Record<number, boolean>>({});

	const [editMember, setEditMember] = useState<TeamMember | null>(null);
	const [editRole, setEditRole] = useState<string>("");
	const [editLoading, setEditLoading] = useState(false);

	const deleteMember = useDeleteMember();
	const updateMember = useUpdateMember();

	useEffect(() => {
		setMembers(initialMembers);
	}, [initialMembers]);

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
			<div className="space-y-2 sm:space-y-3">
				{members.map((m) => (
					<div
						key={m.id}
						className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-popover rounded-md border border-slate-700"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div
								className={clsx(
									"flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-medium",
									m.userId
										? "bg-sky-600 text-white"
										: "bg-slate-700 text-slate-100",
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
								<div className="truncate font-medium text-sm">
									{m.name ?? m.email}
									<span className="ml-1 sm:ml-2 text-xs text-slate-400">· {m.role}</span>
								</div>
								<div className="text-xs text-slate-400 truncate">{m.email}</div>
								{m.team && (
									<div className="text-xs text-slate-400 truncate mt-0.5 sm:hidden">
										Team: {m.team.name}
									</div>
								)}
							</div>
						</div>

						<div className="flex items-center gap-2 ml-auto sm:ml-0">
							<Button
								variant="outline"
								size="sm"
								className="text-xs px-2 py-1 h-7 sm:h-8 sm:text-sm sm:px-3"
								onClick={() => handleEditClick(m)}
								disabled={Boolean(loadingIds[m.id]) || !isAdminOrOwner}
								title={`Edit role for ${m.name ?? m.email}`}
							>
								Edit
							</Button>
							<Button
								variant="ghost"
								size="sm"
								className="h-7 w-7 sm:h-8 sm:w-8 p-0 hover:bg-red-600/10"
								onClick={() => handleDelete(m)}
								disabled={Boolean(loadingIds[m.id]) || !isAdminOrOwner}
								title={`Remove ${m.name ?? m.email}`}
							>
								<Trash2 className="h-4 w-4 text-destructive" />
							</Button>
						</div>
					</div>
				))}
			</div>

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