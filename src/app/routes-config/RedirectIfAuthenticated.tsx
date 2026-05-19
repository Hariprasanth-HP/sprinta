import type React from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/hooks/useAuth";

export function RedirectIfAuth({ children }: { children: React.ReactNode }) {
	const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
	const currentTeam = useAppSelector((s) => s.team.currentTeam);
	if (isAuthenticated) {
		if (currentTeam) {
			return <Navigate to="/team" replace />;
		}
		return <Navigate to="/" replace />;
	}
	return children;
}
