import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useAppSelector } from "@/hooks/useAuth";

const plans = [
	{
		name: "Free",
		price: "$0",
		description: "Perfect for getting started",
		features: ["Up to 5 team members", "2 projects", "Basic task management", "Kanban board view"],
		cta: "Get started",
		href: "/signup",
		featured: false,
	},
	{
		name: "Pro",
		price: "$12",
		period: "/month",
		description: "For growing teams",
		features: ["Unlimited team members", "Unlimited projects", "Priority support", "AI-powered suggestions", "Advanced analytics", "Custom fields"],
		cta: "Start free trial",
		href: "/signup",
		featured: true,
	},
	{
		name: "Enterprise",
		price: "Custom",
		description: "For large organizations",
		features: ["Everything in Pro", "SSO & SAML", "Dedicated account manager", "Custom integrations", "99.99% SLA", "On-premise option"],
		cta: "Contact sales",
		href: "/signup",
		featured: false,
	},
];

const navLinks = [
	{ label: "Features", href: "#features" },
	{ label: "Pricing", href: "#pricing" },
	{ label: "About", href: "/about" },
];

export default function HomePage() {
	const { hash } = useLocation();
	const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

	const scrollTo = (href: string) => {
		if (href.startsWith("#")) {
			const el = document.querySelector(href);
			el?.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		if (hash) {
			setTimeout(() => {
				const el = document.querySelector(hash);
				el?.scrollIntoView({ behavior: "smooth" });
			}, 200);
		}
	}, [hash]);

	return (
		<div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
			<header className="border-b border-slate-800/60 sticky top-0 bg-slate-950/90 backdrop-blur-md z-50">
				<div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
					<Link to="/" className="flex items-center gap-2.5">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-sky-700 shadow-lg shadow-sky-500/20">
							<img src="/vite.png" alt="Sprinta" className="h-5 w-5" />
						</div>
						<span className="text-lg font-bold">Sprinta</span>
					</Link>

					<nav className="hidden md:flex items-center gap-8">
						{navLinks.map((link) =>
							link.href.startsWith("#") ? (
								<button
									key={link.label}
									onClick={() => scrollTo(link.href)}
									className="text-sm text-slate-400 hover:text-white transition"
								>
									{link.label}
								</button>
							) : (
								<Link
									key={link.label}
									to={link.href}
									className="text-sm text-slate-400 hover:text-white transition"
								>
									{link.label}
								</Link>
							),
						)}
					</nav>

					<div className="flex items-center gap-3">
						{isAuthenticated ? (
							<Link to="/team" className="text-sm text-slate-300 hover:text-white transition hidden sm:inline">
								Dashboard
							</Link>
						) : (
							<Link to="/login" className="text-sm text-slate-300 hover:text-white transition hidden sm:inline">
								Log in
							</Link>
						)}
						{!isAuthenticated && (
							<Link to="/signup">
								<Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/25">
									Get started
								</Button>
							</Link>
						)}
					</div>
				</div>
			</header>

			<main className="flex-1">
				<section className="relative overflow-hidden">
					<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent pointer-events-none" />
					<div className="mx-auto max-w-6xl px-6 py-28 sm:py-36 text-center relative">
						<div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-4 py-1.5 text-xs text-slate-300 mb-8">
							<span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
							Now in public beta
						</div>
						<h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-tight">
							Ship faster with{" "}
							<span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">Sprinta</span>
						</h1>
						<p className="mx-auto max-w-2xl text-lg sm:text-xl text-slate-400 mb-10 leading-relaxed">
							A modern project management platform built for teams who want to move fast.
							Plan, track, and ship — all in one place.
						</p>
						<div className="flex items-center justify-center gap-4">
							{isAuthenticated ? (
								<Link to="/team">
									<Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-base px-8 py-6 h-auto shadow-xl shadow-sky-600/30">
										Go to Dashboard
									</Button>
								</Link>
							) : (
								<>
									<Link to="/signup">
										<Button size="lg" className="bg-sky-600 hover:bg-sky-500 text-base px-8 py-6 h-auto shadow-xl shadow-sky-600/30">
											Get started free
										</Button>
									</Link>
									<Link to="/login">
										<Button size="lg" variant="outline" className="text-base px-8 py-6 h-auto border-slate-700 text-slate-300 hover:text-white">
											Log in
										</Button>
									</Link>
								</>
							)}
						</div>
					</div>
				</section>

				<section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Everything you need to ship
						</h2>
						<p className="text-slate-400 max-w-xl mx-auto">
							Powerful features that help your team stay organized, focused, and productive.
						</p>
					</div>
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[
							{
								icon: "📋",
								title: "Task Management",
								desc: "Create, assign, and track tasks with priorities, due dates, and subtasks. Stay on top of everything.",
							},
							{
								icon: "👥",
								title: "Team Collaboration",
								desc: "Invite members, assign roles, and work together seamlessly. Real-time updates across your team.",
							},
							{
								icon: "📊",
								title: "Kanban Boards",
								desc: "Visualize your workflow with drag-and-drop kanban boards. Move tasks through stages effortlessly.",
							},
							{
								icon: "🤖",
								title: "AI Assistance",
								desc: "Generate task descriptions and ideas with built-in AI. Ship smarter, not harder.",
							},
							{
								icon: "🔒",
								title: "Enterprise Security",
								desc: "Role-based access control, encrypted data, and secure authentication via Supabase.",
							},
							{
								icon: "📈",
								title: "Progress Tracking",
								desc: "Monitor project health, track velocity, and make data-driven decisions with clear insights.",
							},
						].map((f) => (
							<div
								key={f.title}
								className="group rounded-xl border border-slate-800 bg-slate-900/40 p-6 hover:border-sky-500/40 hover:bg-slate-900/80 transition-all duration-300"
							>
								<div className="mb-4 text-3xl">{f.icon}</div>
								<h3 className="text-lg font-semibold mb-2">{f.title}</h3>
								<p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
							</div>
						))}
					</div>
				</section>

				<section id="pricing" className="border-t border-slate-800/60 mx-auto max-w-6xl px-6 py-20 sm:py-28">
					<div className="text-center mb-16">
						<h2 className="text-3xl sm:text-4xl font-bold mb-4">
							Simple, transparent pricing
						</h2>
						<p className="text-slate-400 max-w-xl mx-auto">
							Choose the plan that fits your team. No hidden fees, no surprises.
						</p>
					</div>
					<div className="grid gap-8 lg:grid-cols-3 max-w-5xl mx-auto">
						{plans.map((plan) => (
							<div
								key={plan.name}
								className={`relative rounded-2xl border p-8 flex flex-col ${plan.featured
									? "border-sky-500 bg-sky-500/5 shadow-xl shadow-sky-500/10 scale-105 lg:scale-110"
									: "border-slate-800 bg-slate-900/40"
									}`}
							>
								{plan.featured && (
									<div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sky-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
										Most popular
									</div>
								)}
								<div className="mb-6">
									<h3 className="text-lg font-semibold mb-1">{plan.name}</h3>
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-bold">{plan.price}</span>
										{plan.period && <span className="text-slate-400 text-sm">{plan.period}</span>}
									</div>
									<p className="text-sm text-slate-400 mt-2">{plan.description}</p>
								</div>
								<ul className="space-y-3 mb-8 flex-1">
									{plan.features.map((f) => (
										<li key={f} className="flex items-start gap-3 text-sm text-slate-300">
											<Check className="h-4 w-4 text-sky-400 mt-0.5 shrink-0" />
											{f}
										</li>
									))}
								</ul>
								<Link to={plan.href}>
									<Button
										className={`w-full ${plan.featured
											? "bg-sky-600 hover:bg-sky-500 text-white"
											: "bg-slate-800 hover:bg-slate-700 text-slate-200"
											}`}
									>
										{plan.cta}
									</Button>
								</Link>
							</div>
						))}
					</div>
				</section>
			</main>

			<footer className="border-t border-slate-800/60">
				<div className="mx-auto max-w-6xl px-6 py-12">
					<div className="grid gap-8 sm:grid-cols-3">
						<div>
							<Link to="/" className="flex items-center gap-2 text-sm text-slate-400 mb-3">
								<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-sky-700">
									<img src="/vite.png" alt="Sprinta" className="h-4 w-4" />
								</div>
								Sprinta
							</Link>
							<p className="text-xs text-slate-600 max-w-xs">
								Ship faster with your team. Modern project management for modern teams.
							</p>
						</div>
						<div className="sm:col-span-2 flex flex-wrap justify-end gap-10">
							<div>
								<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Product</h4>
								<div className="flex flex-col gap-2">
									<button onClick={() => scrollTo("#features")} className="text-sm text-slate-400 hover:text-white transition text-left">
										Features
									</button>
									<button onClick={() => scrollTo("#pricing")} className="text-sm text-slate-400 hover:text-white transition text-left">
										Pricing
									</button>
									<Link to="/about" className="text-sm text-slate-400 hover:text-white transition">
										About
									</Link>
								</div>
							</div>
							<div>
								<h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Legal</h4>
								<div className="flex flex-col gap-2">
									<Link to="/privacy" className="text-sm text-slate-400 hover:text-white transition">
										Privacy Policy
									</Link>
									<Link to="/terms" className="text-sm text-slate-400 hover:text-white transition">
										Terms of Service
									</Link>
								</div>
							</div>
						</div>
					</div>
					<div className="mt-10 pt-6 border-t border-slate-800/60 text-center text-xs text-slate-600">
						&copy; {new Date().getFullYear()} Sprinta. All rights reserved.
					</div>
				</div>
			</footer>
		</div>
	);
}