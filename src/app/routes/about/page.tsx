import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
	{
		title: "Team Management",
		description: "Easily invite and manage team members with role-based permissions.",
		icon: "👥",
	},
	{
		title: "Project Planning",
		description: "Organize your work with projects, lists, and tasks in a flexible kanban board.",
		icon: "📋",
	},
	{
		title: "Task Tracking",
		description: "Track priorities, due dates, assignees, and subtasks all in one place.",
		icon: "✅",
	},
	{
		title: "AI Assistance",
		description: "Generate task descriptions and ideas with built-in AI assistance.",
		icon: "🤖",
	},
];

const techStack = [
	{ name: "React", category: "Frontend" },
	{ name: "TypeScript", category: "Language" },
	{ name: "Vite", category: "Build Tool" },
	{ name: "Redux Toolkit", category: "State Management" },
	{ name: "Radix UI", category: "UI Components" },
	{ name: "Tailwind CSS", category: "Styling" },
	{ name: "Supabase", category: "Backend" },
];

export default function AboutPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto max-w-4xl px-6 py-16">
				<div className="mb-16 text-center">
					<div className="mb-4 inline-flex h-24 w-24 items-center justify-center rounded-full bg-white">
						<img src="/vite.png" alt="Sprinta" className="h-12 w-12" />
					</div>
					<h1 className="mb-4 text-4xl font-bold tracking-tight">Sprinta</h1>
					<p className="mx-auto mb-6 max-w-2xl text-lg text-slate-400">
						A modern project management platform built for teams who want to ship faster.
						Plan, track, and collaborate with ease.
					</p>
					<Link to="/signup">
						<Button size="lg" className="bg-sky-600 hover:bg-sky-700">
							Get Started
						</Button>
					</Link>
				</div>

				<div className="mb-16">
					<h2 className="mb-8 text-center text-2xl font-semibold">Features</h2>
					<div className="grid gap-6 sm:grid-cols-2">
						{features.map((f) => (
							<div
								key={f.title}
								className="rounded-lg border border-slate-800 bg-slate-900/50 p-6"
							>
								<div className="mb-3 text-3xl">{f.icon}</div>
								<h3 className="mb-2 font-semibold">{f.title}</h3>
								<p className="text-sm text-slate-400">{f.description}</p>
							</div>
						))}
					</div>
				</div>

				<div className="mb-16">
					<h2 className="mb-8 text-center text-2xl font-semibold">Tech Stack</h2>
					<div className="flex flex-wrap justify-center gap-3">
						{techStack.map((t) => (
							<div
								key={t.name}
								className="rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm"
							>
								<span className="font-medium">{t.name}</span>
								<span className="ml-2 text-xs text-slate-500">{t.category}</span>
							</div>
						))}
					</div>
				</div>

				<div className="rounded-lg border border-slate-800 bg-slate-900/50 p-8 text-center">
					<h2 className="mb-4 text-xl font-semibold">Open Source</h2>
					<p className="mb-4 text-slate-400">
						Sprinta is built with passion to help teams collaborate better.
						We believe great tools should be accessible to everyone.
					</p>
					<p className="text-sm text-slate-500">
						Version 1.0.0 · Built with care
					</p>
				</div>
			</div>
		</div>
	);
}