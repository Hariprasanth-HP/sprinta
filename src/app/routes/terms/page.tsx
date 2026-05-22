import { Link } from "react-router-dom";

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto max-w-3xl px-6 py-16">
				<Link to="/" className="text-sm text-sky-400 hover:underline mb-8 inline-block">
					← Back to Home
				</Link>
				<h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
				<div className="space-y-6 text-slate-300 text-sm leading-relaxed">
					<p>Last updated: May 2026</p>

					<h2 className="text-lg font-semibold text-white mt-8">1. Acceptance of Terms</h2>
					<p>By accessing or using Sprinta, you agree to be bound by these Terms of Service. If you do not agree, you may not use the service.</p>

					<h2 className="text-lg font-semibold text-white mt-8">2. Description of Service</h2>
					<p>Sprinta provides project management and team collaboration tools, including task tracking, kanban boards, and team management features.</p>

					<h2 className="text-lg font-semibold text-white mt-8">3. User Responsibilities</h2>
					<p>You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account. You agree not to misuse the platform or interfere with its operation.</p>

					<h2 className="text-lg font-semibold text-white mt-8">4. Acceptable Use</h2>
					<p>You agree not to upload malicious content, violate laws, infringe on others' rights, or attempt to gain unauthorized access to our systems.</p>

					<h2 className="text-lg font-semibold text-white mt-8">5. Limitation of Liability</h2>
					<p>Sprinta is provided "as is" without warranties of any kind. We are not liable for damages arising from your use of the service, to the maximum extent permitted by law.</p>

					<h2 className="text-lg font-semibold text-white mt-8">6. Changes to Terms</h2>
					<p>We may update these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>

					<h2 className="text-lg font-semibold text-white mt-8">7. Termination</h2>
					<p>We reserve the right to suspend or terminate accounts that violate these terms or engage in prohibited activities.</p>
				</div>
			</div>
		</div>
	);
}