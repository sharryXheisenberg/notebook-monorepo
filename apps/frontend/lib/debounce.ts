// Simple debounce for the block-content autosave — avoids firing a PATCH request on
// every keystroke, which would both hammer the free-tier Render instance and risk
// last-write-wins races between rapid edits (see TRD v2 storage note on Aiven's
// conservative connection pool).
export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number
): (...args: Args) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delayMs);
  };
}
