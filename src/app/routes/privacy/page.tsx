import { Link } from "react-router-dom";

export default function PrivacyPage() {
	return (
		<div className="min-h-screen bg-slate-950 text-slate-100">
			<div className="mx-auto max-w-3xl px-6 py-16">
				<Link to="/" className="text-sm text-sky-400 hover:underline mb-8 inline-block">
					← Back to Home
				</Link>
				<h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
				<div className="space-y-6 text-slate-300 text-sm leading-relaxed">
					<p>Last updated: May 2026</p>

					<h2 className="text-lg font-semibold text-white mt-8">1. Information We Collect</h2>
					<p>We collect information you provide when creating an account, such as your name, email address, and profile information. We also collect data about your usage of the platform, including projects, tasks, and team interactions.</p>

					<h2 className="text-lg font-semibold text-white mt-8">2. How We Use Your Information</h2>
					<p>Your information is used to provide and improve our services, communicate with you, ensure security, and comply with legal obligations. We do not sell your personal data to third parties.</p>

					<h2 className="text-lg font-semibold text-white mt-8">3. Data Storage and Security</h2>
					<p>We use industry-standard security measures to protect your data. Your information is stored securely on cloud infrastructure provided by Supabase. We retain your data for as long as your account is active or as needed to provide services.</p>

					<h2 className="text-lg font-semibold text-white mt-8">4. Third-Party Services</h2>
					<p>We may integrate with third-party services to provide core functionality (e.g., authentication, hosting). These services have their own privacy policies governing data handling.</p>

					<h2 className="text-lg font-semibold text-white mt-8">5. Your Rights</h2>
					<p>You have the right to access, correct, or delete your personal data. You can manage your account settings at any time or contact us to request data deletion.</p>

					<h2 className="text-lg font-semibold text-white mt-8">6. Contact</h2>
					<p>If you have questions about this policy, please reach out to our support team.</p>
				</div>
			</div>
		</div>
	);
}