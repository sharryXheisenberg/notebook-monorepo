import Link from "next/link";

// Landing route — redirects logic lives in middleware.ts for authenticated users;
// this is what an unauthenticated visitor sees.
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
      <h1 className="text-3xl font-semibold">All-in-One Developer Notebook</h1>
      <p className="text-ink-muted max-w-md text-center">
        Write notes, run code, and review it — without switching apps.
      </p>
      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 rounded-md bg-annotation text-canvas font-medium">
          Log in
        </Link>
        <Link href="/register" className="px-4 py-2 rounded-md border border-border-subtle">
          Create account
        </Link>
      </div>
    </main>
  );
}
