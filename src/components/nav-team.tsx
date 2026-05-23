"use client";

import {
	DropdownMenuLabel,
	DropdownMenuSeparator,
} from "@radix-ui/react-dropdown-menu";
import { TabsContent } from "@radix-ui/react-tabs";
import {
	IconCreditCard,
	IconDotsVertical,
	IconLogout,
	IconUserCircle,
} from "@tabler/icons-react";
import { useContext, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SideBarContext } from "@/contexts/sidebar-context";
import { clearTeam } from "@/features/auth/stores/teamSlice";
import { clearProject } from "@/features/auth/stores/projectSlice";
import { useCreateMembers } from "@/features/teams/api/member";
import { ManageMembers } from "@/features/teams/components/manage-members";
import { useAppSelector } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { logout } from "@/features/auth/stores/authSlice";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "./ui/sidebar";
export function NavTeam() {
	const [showTeamDialog, setShowTeamDialog] = useState(false);
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const { team } = useContext(SideBarContext)!;
	const navigate = useNavigate();
	const dispatch = useDispatch();

	async function handleLogout() {
		await supabase.auth.signOut();
		dispatch(logout());
		toast.info("Logged out successfully");
	}

	if (!team) return null;
	return (
		<>
			<SidebarMenu>
				<SidebarMenuItem>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<SidebarMenuButton
								size="lg"
								className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar className="h-8 w-8 rounded-lg grayscale">
									<AvatarFallback className="rounded-lg">CN</AvatarFallback>
								</Avatar>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-medium">{team.name}</span>
								</div>
								<IconDotsVertical className="ml-auto size-4" />
							</SidebarMenuButton>
						</DropdownMenuTrigger>
						<DropdownMenuContent
							className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
							align="end"
							sideOffset={4}
						>
							<DropdownMenuLabel className="p-0 font-normal">
								<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarFallback className="rounded-lg">CN</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-medium">{team.name}</span>
									</div>
								</div>
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuGroup>
								<DropdownMenuItem onSelect={() => setShowTeamDialog(true)}>
									<IconUserCircle />
									Account
								</DropdownMenuItem>
								<DropdownMenuItem onSelect={() => navigate("/team/billing")}>
									<IconCreditCard />
									Billing
								</DropdownMenuItem>
							</DropdownMenuGroup>
							<DropdownMenuSeparator />
							<DropdownMenuItem onSelect={() => setShowLogoutDialog(true)}>
								<IconLogout />
								Log out
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</SidebarMenuItem>
			</SidebarMenu>
			<Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
				<DialogContent className="sm:max-w-[90%] overflow-auto">
					<DialogHeader>
						<DialogTitle>Manage team</DialogTitle>
					</DialogHeader>
					<ManageTeam />
				</DialogContent>
			</Dialog>
			<AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure you want to log out?</AlertDialogTitle>
						<AlertDialogDescription>
							You will be redirected to the login page. Your session will be ended.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleLogout}>Log out</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}

type Row = {
	id: string; // local key
	email: string;
	name?: string;
	role: string;
};

type RowErrors = {
	email?: string;
	role?: string;
};
export enum TeamRole {
	OWNER = "OWNER",
	ADMIN = "ADMIN",
	MEMBER = "MEMBER",
}
const EMAIL_RE = /^\S+@\S+\.\S+$/;
export function ManageTeam() {
	const currentTeam = useAppSelector((s) => s.team.currentTeam);
	const user = useAppSelector((s) => s.auth.user);
	const team = currentTeam;

	const [rows, setRows] = useState<Row[]>(() => [
		{ id: cryptoRandomId(), email: "", name: "", role: TeamRole.MEMBER },
		{ id: cryptoRandomId(), email: "", name: "", role: TeamRole.MEMBER },
		{ id: cryptoRandomId(), email: "", name: "", role: TeamRole.MEMBER },
	]);
	const [errors, setErrors] = useState<Record<string, RowErrors>>({});
	const [globalError, setGlobalError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const TEAM_ROLE_OPTIONS = Object.values(TeamRole);

	function cryptoRandomId() {
		// small helper for unique ids (works in modern browsers)
		return Math.random().toString(36).slice(2, 9);
	}

	function updateRow(id: string, patch: Partial<Row>) {
		setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
		// clear error for field being updated
		setErrors((prev) => {
			const copy = { ...prev };
			if (!copy[id]) return copy;
			if (patch.email) copy[id] = { ...copy[id], email: undefined };
			if (patch.role) copy[id] = { ...copy[id], role: undefined };
			return copy;
		});
	}

	function validateRows(rowsToValidate: Row[]) {
		const e: Record<string, RowErrors> = {};
		let valid = true;
		rowsToValidate.forEach((r) => {
			const rowErr: RowErrors = {};
			const email = (r.email ?? "").trim();
			if (!email) {
				rowErr.email = "Email is required.";
				valid = false;
			} else if (!EMAIL_RE.test(email)) {
				rowErr.email = "Invalid email address.";
				valid = false;
			}
			const role = (r.role ?? "").trim();
			if (!role) {
				rowErr.role = "Role is required.";
				valid = false;
			}
			if (Object.keys(rowErr).length > 0) {
				e[r.id] = rowErr;
			}
		});

		return { valid, errors: e };
	}
	const createmembers = useCreateMembers();
	async function handleSubmit(e?: React.FormEvent) {
		e?.preventDefault();
		setGlobalError(null);
		setSuccessMsg(null);

		// trim out completely empty rows (where email is empty)
		const meaningfulRows = rows.filter(
			(r) => (r.email ?? "").trim().length > 0,
		);

		if (meaningfulRows.length === 0) {
			setGlobalError("Please add at least one member email.");
			return;
		}

		const { valid, errors: validationErrors } = validateRows(meaningfulRows);
		if (!valid) {
			setErrors(validationErrors);
			setGlobalError("Fix the errors before submitting.");
			return;
		}

		// Build payload aligned with TeamMember model
		const membersPayload = meaningfulRows.map((r) => ({
			email: r.email.trim().toLowerCase(),
			name: r.name?.trim() || null,
			role: r.role.trim(),
			// teamId and addedById are sent by the route itself or the server expects teamId in URL
		}));

		setLoading(true);

		try {
			const { data = undefined, added = 0 } = await createmembers.mutateAsync({
				members: membersPayload,
				teamId: Number(team?.id),
				userId: user?.id!,
			});

			if (!data) {
				setGlobalError("Failed to add members.");
				setLoading(false);
				return;
			}

			setSuccessMsg(
				`Added ${Array.isArray(added) ? added : membersPayload.length
				} member(s).`,
			);
			setRows(() => [
				{ id: cryptoRandomId(), email: "", name: "", role: "member" },
				{ id: cryptoRandomId(), email: "", name: "", role: "member" },
				{ id: cryptoRandomId(), email: "", name: "", role: "member" },
			]);
			setErrors({});
		} catch (err: unknown) {
			console.error(err);
			setGlobalError(
				err instanceof Error ? err?.message : "Failed to add members.",
			);
		} finally {
			setLoading(false);
		}
	}

	const dispatch = useDispatch();
	const navigate = useNavigate();
	async function handleCreateWorkspace() {
		dispatch(clearTeam());
		dispatch(clearProject());
		navigate("/team");
	}

	return <>
		<div className="flex h-full flex-col">
			<div className="flex-1 p-4 sm:p-6 overflow-auto">
				<div className="flex flex-col gap-6 max-w-3xl mx-auto">
					<div className="flex items-center justify-between">
						<h2 className="text-xl font-semibold">{team?.name}</h2>
						<Button
							variant="outline"
							size="sm"
							disabled={loading}
							onClick={handleCreateWorkspace}
						>
							Create workspace
						</Button>
					</div>

					<Tabs defaultValue="add" className="w-full">
						<TabsList className="bg-muted/50 p-1 rounded-lg w-full sm:w-auto">
							<TabsTrigger value="add" className="text-sm px-4 py-2">
								Add Members
							</TabsTrigger>
							<TabsTrigger value="members" className="text-sm px-4 py-2">
								Manage Members
							</TabsTrigger>
						</TabsList>

						<TabsContent value="add" className="mt-6">
							<div className="bg-card border rounded-xl p-6">
								<h3 className="text-base font-medium mb-4">
									Invite team members
								</h3>

								<div className="space-y-4">
									{rows.map((r, index) => (
										<div
											key={`row-${r.id}`}
											className="flex flex-col sm:flex-row gap-3 p-4 bg-muted/30 rounded-lg"
										>
											<div className="flex-1 space-y-2">
												<Label className="text-xs text-muted-foreground">
													Email Address {index + 1}
												</Label>
												<Input
													value={r.email}
													onChange={(ev) =>
														updateRow(r.id, { email: ev.target.value })
													}
													placeholder="email@example.com"
													className="bg-background"
													aria-invalid={Boolean(errors[r.id]?.email)}
												/>
												{errors[r.id]?.email && (
													<p className="text-xs text-destructive">
														{errors[r.id]?.email}
													</p>
												)}
											</div>

											<div className="w-full sm:w-36 space-y-2">
												<Label className="text-xs text-muted-foreground">
													Name (optional)
												</Label>
												<Input
													value={r.name ?? ""}
													onChange={(ev) =>
														updateRow(r.id, { name: ev.target.value })
													}
													placeholder="Name"
													className="bg-background"
												/>
											</div>

											<div className="w-full sm:w-32 space-y-2">
												<Label className="text-xs text-muted-foreground">
													Role
												</Label>
												<Select
													value={r.role}
													onValueChange={(value) =>
														updateRow(r.id, { role: value })
													}
												>
													<SelectTrigger className="bg-background">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{TEAM_ROLE_OPTIONS.map((role) => (
															<SelectItem key={role} value={role}>
																{role.charAt(0) + role.slice(1).toLowerCase()}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
												{errors[r.id]?.role && (
													<p className="text-xs text-destructive">
														{errors[r.id]?.role}
													</p>
												)}
											</div>
										</div>
									))}
								</div>

								<div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-6 pt-4 border-t">
									<Button
										type="submit"
										disabled={loading}
										onClick={(e) => handleSubmit(e)}
									>
										{loading ? "Adding…" : "Add Members"}
									</Button>

									{globalError && (
										<p className="text-sm text-destructive">{globalError}</p>
									)}
									{successMsg && (
										<p className="text-sm text-green-500">{successMsg}</p>
									)}
								</div>
							</div>
						</TabsContent>

						<TabsContent value="members" className="mt-6">
							<ManageMembers teamId={Number(team?.id)} />
						</TabsContent>
					</Tabs>
				</div>
			</div>
		</div>
	</>

}

