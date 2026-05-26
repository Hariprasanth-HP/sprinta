// src/AppRoutes.tsx
import { Helmet } from "react-helmet-async";
import { Suspense } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import HomePage from "@/app/routes/home/page";
import PrivacyPage from "@/app/routes/privacy/page";
import TermsPage from "@/app/routes/terms/page";
import AboutPage from "@/app/routes/about/page";
import TeamPage from "@/app/routes/company/page";
import LoginPage from "@/app/routes/login/page";
import SignupPage from "@/app/routes/signup/signup";
import NotFoundPage from "@/components/not-found";
import AuthCallback from "./callback";
import ProtectedRoutes from "./protectedRoutes";
import { RequireAuth } from "./RequireAuth";

const routeMeta: Record<string, { title: string; description: string }> = {
  "/": {
    title: "Sprinta — Smart Project Management",
    description:
      "A modern project management platform built for teams who want to move fast. Plan, track, and ship — all in one place.",
  },
  "/about": { title: "About — Sprinta", description: "Learn about Sprinta — a modern project management platform built for teams who want to ship faster." },
  "/privacy": { title: "Privacy Policy — Sprinta", description: "Sprinta privacy policy — how we collect, use, and protect your personal data." },
  "/terms": { title: "Terms of Service — Sprinta", description: "Sprinta terms of service — the rules and guidelines for using our project management platform." },
  "/login": { title: "Sign In — Sprinta", description: "Sign in to your Sprinta account to manage projects and collaborate with your team." },
  "/signup": { title: "Sign Up — Sprinta", description: "Create your Sprinta account and start managing projects with your team." },
  "/team": { title: "Team — Sprinta", description: "Manage your Sprinta teams — create or select a team to start collaborating." },
  "/team/billing": { title: "Billing — Sprinta", description: "Manage your Sprinta subscription, view plan details, and upgrade your billing plan." },
};

const fallbackMeta = { title: "Sprinta", description: "Project management platform for modern teams." };

function RouteMeta() {
  const { pathname } = useLocation();
  const meta =
    routeMeta[pathname] ??
    (pathname.startsWith("/team/") && pathname !== "/team/billing"
      ? { title: "Dashboard — Sprinta", description: "Sprinta project dashboard — view and manage your tasks, projects, and team workflow." }
      : undefined) ??
    fallbackMeta;

  return (
    <Helmet>
      <title>{meta.title}</title>
      <meta name="description" content={meta.description} />
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary" />
    </Helmet>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter basename={import.meta.env.VITE_BASE_PATH}>
      <RouteMeta />
      <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/callback" element={<AuthCallback />} />
          <Route
            path="/team"
            element={
              <RequireAuth>
                <TeamPage />
              </RequireAuth>
            }
          />
          <Route
            path="/team/*"
            element={
              <RequireAuth>
                <ProtectedRoutes />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
