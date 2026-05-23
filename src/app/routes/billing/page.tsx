import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/hooks/useAuth";
import { Check } from "lucide-react";

const planDetails = {
	free: {
		name: "Free",
		price: "$0",
		period: null,
		features: [
			"Up to 5 team members",
			"2 projects",
			"Basic task management",
			"Kanban board view",
		],
		maxMembers: 5,
		maxProjects: 2,
	},
	pro: {
		name: "Pro",
		price: "$12",
		period: "/month",
		features: [
			"Unlimited team members",
			"Unlimited projects",
			"Priority support",
			"AI-powered suggestions",
			"Advanced analytics",
			"Custom fields",
		],
		maxMembers: Infinity,
		maxProjects: Infinity,
	},
	enterprise: {
		name: "Enterprise",
		price: "Custom",
		period: null,
		features: [
			"Everything in Pro",
			"SSO & SAML",
			"Dedicated account manager",
			"Custom integrations",
			"99.99% SLA",
			"On-premise option",
		],
		maxMembers: Infinity,
		maxProjects: Infinity,
	},
};

export default function BillingPage() {
	const plan = useAppSelector((s) => s.team.plan);
	const current = planDetails[plan];

	return (
		<div className="p-6 max-w-2xl">
			<div className="mb-8">
				<h1 className="text-2xl font-semibold">Billing</h1>
				<p className="text-muted-foreground text-sm mt-1">
					Manage your subscription and billing details.
				</p>
			</div>

			<div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8">
				<div className="flex items-start justify-between mb-6">
					<div>
						<h2 className="text-xl font-semibold">{current.name} Plan</h2>
						<p className="text-muted-foreground text-sm mt-1">
							{plan === "enterprise"
								? "Custom pricing for your organization"
								: "You are on the Free plan"}
						</p>
					</div>
					<div className="text-right">
						<div className="text-3xl font-bold">{current.price}</div>
						{current.period && (
							<div className="text-sm text-muted-foreground">
								{current.period}
							</div>
						)}
					</div>
				</div>

				<div className="mb-8">
					<h3 className="text-sm font-medium mb-3">Plan includes</h3>
					<ul className="grid sm:grid-cols-2 gap-2">
						{current.features.map((f) => (
							<li
								key={f}
								className="flex items-start gap-2 text-sm text-slate-300"
							>
								<Check className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
								{f}
							</li>
						))}
					</ul>
				</div>

				<div className="mb-8">
					<h3 className="text-sm font-medium mb-3">Usage</h3>
					<div className="space-y-3">
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span className="text-muted-foreground">Members</span>
								<span>
									{current.maxMembers === Infinity
										? "Unlimited"
										: `0 / ${current.maxMembers}`}
								</span>
							</div>
							{current.maxMembers < Infinity && (
								<div className="h-2 rounded-full bg-slate-800 overflow-hidden">
									<div
										className="h-full rounded-full bg-sky-600"
										style={{ width: "0%" }}
									/>
								</div>
							)}
						</div>
						<div>
							<div className="flex justify-between text-sm mb-1">
								<span className="text-muted-foreground">Projects</span>
								<span>
									{current.maxProjects === Infinity
										? "Unlimited"
										: `0 / ${current.maxProjects}`}
								</span>
							</div>
							{current.maxProjects < Infinity && (
								<div className="h-2 rounded-full bg-slate-800 overflow-hidden">
									<div
										className="h-full rounded-full bg-sky-600"
										style={{ width: "0%" }}
									/>
								</div>
							)}
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3 pt-6 border-t border-slate-800">
					<Link to="/#pricing">
						<Button className="bg-sky-600 hover:bg-sky-500 text-white">
							{plan === "free" ? "Upgrade plan" : "Change plan"}
						</Button>
					</Link>
					<Link to="/#pricing">
						<Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
							Compare all plans
						</Button>
					</Link>
				</div>
			</div>
		</div>
	);
}
