import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function HomePage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			<header className="border-b border-slate-800">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
					<div className="flex items-center gap-3">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-sm font-bold">S</div>
						<span className="text-lg font-semibold">Sprinta</span>
					</div>
					<div className="flex items-center gap-4">
						<Link to="/login" className="text-sm text-slate-300 hover:text-white transition">Log in</Link>
						<Link to="/signup">
							<Button size="sm" className="bg-sky-600 hover:bg-sky-700">Get started</Button>
						</Link>
					</div>
				</div>
			</header>

			<main className="flex-1">
				<section className="mx-auto max-w-6xl px-6 py-24 text-center">
					<h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6">
						Ship faster with{" "}
						<span className="text-sky-400">Sprinta</span>
					</h1>
					<p className="mx-auto max-w-2xl text-lg text-slate-400 mb-10">
						A modern project management platform built for teams. Plan projects, track tasks,
						manage members, and collaborate in real time.
					</p>
					<div className="flex items-center justify-center gap-4">
						<Link to="/signup">
							<Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-base px-8">
								Get started free
							</Button>
						</Link>
						<Link to="/login">
							<Button size="lg" variant="outline" className="text-base px-8">
								Log in
							</Button>
						</Link>
					</div>
				</section>

				<section className="mx-auto max-w-6xl px-6 py-16">
					<div className="grid gap-8 sm:grid-cols-3">
						<div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
							<div className="mb-4 text-3xl">📋</div>
							<h3 className="text-lg font-semibold mb-2">Task Management</h3>
							<p className="text-sm text-slate-400">Create, assign, and track tasks with priorities, due dates, and subtasks.</p>
						</div>
						<div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
							<div className="mb-4 text-3xl">👥</div>
							<h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
							<p className="text-sm text-slate-400">Invite members, assign roles, and work together seamlessly.</p>
						</div>
						<div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6">
							<div className="mb-4 text-3xl">📊</div>
							<h3 className="text-lg font-semibold mb-2">Kanban Boards</h3>
							<p className="text-sm text-slate-400">Visualize your workflow with drag-and-drop kanban boards.</p>
						</div>
					</div>
				</section>
			</main>

			<footer className="border-t border-slate-800">
				<div className="mx-auto max-w-6xl px-6 py-8">
					<div className="flex flex-col sm:flex-row items-center justify-between gap-4">
						<div className="flex items-center gap-2 text-sm text-slate-500">
							<div className="flex h-6 w-6 items-center justify-center rounded bg-sky-600 text-xs font-bold">S</div>
							Sprinta
						</div>
						<div className="flex items-center gap-6 text-sm text-slate-500">
							<Link to="/privacy" className="hover:text-slate-300 transition">Privacy Policy</Link>
							<Link to="/terms" className="hover:text-slate-300 transition">Terms of Service</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}