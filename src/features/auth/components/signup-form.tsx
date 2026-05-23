import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SignupPayload } from "@/types/auth";

export function SignupForm({
	className,
	onSubmit,
	handleGoogleSignup,
	...props
}: {
	onSubmit: (userData: SignupPayload) => Promise<void>;
	handleGoogleSignup: () => void;
	className?: string;
}) {
	const [formData, setFormData] = useState({
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
	});

	const [errors, setErrors] = useState<
		SignupPayload & { confirmPassword: string; form?: string }
	>({
		email: "",
		username: "",
		password: "",
		confirmPassword: "",
		form: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		setErrors((prev) => ({
			...prev,
			[name]: "",
		}));
	};

	const validate = () => {
		const newErrors: SignupPayload & {
			confirmPassword: string;
		} = {
			email: "",
			username: "",
			password: "",
			confirmPassword: "",
		};

		if (!formData.email.trim()) {
			newErrors.email = "Email is required.";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Enter a valid email.";
		}

		if (!formData.password) {
			newErrors.password = "Password is required.";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters.";
		}

		if (!formData.username) {
			newErrors.username = "Name is required.";
		}

		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Confirm your password.";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match.";
		}

		return newErrors;
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		const newErrors = validate();
		setErrors(newErrors);
		if (Object.keys(newErrors).length > 0) {
			Object.keys(newErrors).forEach((key) => {
				if (newErrors[key as keyof typeof newErrors] !== '') {
					return
				}
			});
		}
		setSubmitting(true);

		const fd = new FormData();
		Object.entries(formData).forEach(([k, v]) => fd.append(k, v));

		try {
			await onSubmit({
				username: formData?.username,
				email: formData?.email,
				password: formData.password,
			});
		} catch (err) {
			if (err instanceof Error) {
				setErrors({ ...errors, form: err.message });
			}
		} finally {
			setSubmitting(false);
		}
	};
	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">Create your account</h1>
								<p className="text-muted-foreground text-sm text-balance">
									Enter your email below to create your account
								</p>
							</div>
							<Field>
								<FieldLabel htmlFor="email">Email</FieldLabel>
								<Input
									name="email"
									id="email"
									type="email"
									placeholder="m@example.com"
									required
									value={formData.email}
									onChange={handleChange}
								/>
								{errors.email && (
									<p className="text-red-600 text-sm">{errors.email}</p>
								)}
								<FieldDescription>
									We&apos;ll use this to contact you. We will not share your
									email with anyone else.
								</FieldDescription>
							</Field>
							<Field>
								<FieldLabel htmlFor="name">Name</FieldLabel>
								<Input
									name="username"
									id="username"
									type="name"
									required
									value={formData.username}
									onChange={handleChange}
								/>
								{errors.username && (
									<p className="text-red-600 text-sm">{errors.username}</p>
								)}
							</Field>
							<Field>
								<Field className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="password">Password</FieldLabel>
										<Input
											name="password"
											id="password"
											type="password"
											required
											value={formData.password}
											onChange={handleChange}
										/>
										{errors.password && (
											<p className="text-red-600 text-sm">{errors.password}</p>
										)}
									</Field>
									<Field>
										<FieldLabel htmlFor="confirm-password">
											Confirm Password
										</FieldLabel>
										<Input
											name="confirmPassword"
											id="confirm-password"
											type="password"
											required
											value={formData.confirmPassword}
											onChange={handleChange}
										/>
										{errors.confirmPassword && (
											<p className="text-red-600 text-sm">
												{errors.confirmPassword}
											</p>
										)}
									</Field>
								</Field>
								<FieldDescription>
									Must be at least 8 characters long.
								</FieldDescription>
							</Field>
							<Field>
								<Button
									type="submit"
									disabled={submitting}
									className="bg-black text-white px-4 py-2"
								>
									{submitting ? "Submitting..." : "Create Account"}
								</Button>
							</Field>
							<FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
								Or continue with
							</FieldSeparator>
							<Field className="grid grid-cols-1 gap-4">
								<Button
									variant="outline"
									type="button"
									onClick={handleGoogleSignup}
								>
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
										<path
											d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
											fill="currentColor"
										/>
									</svg>
									Sign up with Google
								</Button>
							</Field>
							<FieldDescription className="text-center">
								Already have an account? <Link to="/login">Sign in</Link>
							</FieldDescription>
						</FieldGroup>
					</form>
					<div className="bg-muted relative hidden md:flex flex-col items-center justify-center gap-4 p-8">
						<div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-sky-600 shadow-xl shadow-sky-500/30 ring-4 ring-sky-400/20">
							<img src="/vite.png" alt="Sprinta" className="h-12 w-12" />
						</div>
						<h2 className="text-2xl font-bold">Sprinta</h2>
						<p className="text-muted-foreground text-sm text-center max-w-xs">
							Ship faster with your team. Plan, track, and collaborate in one place.
						</p>
					</div>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our <Link to="/terms">Terms of Service</Link>{" "}
				and <Link to="/privacy">Privacy Policy</Link>.
			</FieldDescription>
		</div>
	);
}
