import { createFileRoute, redirect } from "@tanstack/react-router";
import { getCurrentUserFn } from "#/utils/auth-server";

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const user = await getCurrentUserFn();

    if (!user) {
      throw redirect({
        to: "/api/auth/login",
        reloadDocument: true,
      });
    }

    return { user };
  },
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      <section className="island-shell rise-in rounded-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
        <p className="mb-4">Welcome, {user?.user?.name || user?.user?.email}!</p>
        <p className="text-sm text-[var(--sea-ink-soft)]">
          This page is protected and only visible to logged-in users.
        </p>
        <button
          onClick={handleLogout}
          className="mt-4 rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
        >
          Logout
        </button>
      </section>
    </main>
  );
}
