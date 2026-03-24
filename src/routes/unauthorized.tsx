import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Access Denied</h1>
      <p className="text-muted-foreground">You don't have permission to access this application.</p>
      <a href="/api/auth/logout" className="text-primary underline">
        Sign out
      </a>
    </div>
  );
}
