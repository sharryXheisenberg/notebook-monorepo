export function Spinner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-border-subtle border-t-signal h-4 w-4 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
