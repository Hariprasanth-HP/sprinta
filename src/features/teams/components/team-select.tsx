import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { setTeam } from "@/features/auth/stores/teamSlice";
import { useFetchUserteams } from "@/features/teams/api/team";
import { useAppDispatch, useAppSelector } from "@/hooks/useAuth";
import type { Team } from "@/types/type";
import { clearProject } from "@/features/auth/stores/projectSlice";
export function TeamSelect() {
	const currentTeam = useAppSelector((s) => s.team.currentTeam);
	const user = useAppSelector((s) => s.auth.user);
	const fetchuserTeams = useFetchUserteams();
	const [selectedTeam, setSelectedTeam] = React.useState<Team | undefined>(
		currentTeam ?? undefined,
	);
	const [teams, setTeams] = React.useState<Team[]>([]);
	const dispatch = useAppDispatch();
	const navigate = useNavigate();
	const handleChange = (value: string) => {
		const id = Number(value);
		if (Number.isNaN(id)) return;

		const foundTeam = teams.find((t) => Number(t.id) === id);
		if (!foundTeam) return;

		setSelectedTeam(foundTeam);
		dispatch(setTeam(foundTeam));
		dispatch(clearProject());
		navigate(`/team/${foundTeam.id}`);
	};

	React.useEffect(() => {
		async function fetchUserTeamsData() {
			const { data } = await fetchuserTeams.mutateAsync({ user });
			setTeams(data);
		}
		fetchUserTeamsData();
	}, []);

	React.useEffect(() => {
		if (currentTeam) {
			setSelectedTeam(currentTeam);
		}
	}, [currentTeam]);

	return (
		<Select onValueChange={handleChange} value={String(selectedTeam?.id)!}>
			<SelectTrigger className="w-auto border-0 focus:ring-0 focus:outline-none shadow-none">
				<SelectValue placeholder="Select a Team" />
			</SelectTrigger>
			<SelectContent>
				{teams.map((team) => {
					return <SelectItem value={String(team.id)}>{team.name}</SelectItem>;
				})}
			</SelectContent>
		</Select>
	);
}
