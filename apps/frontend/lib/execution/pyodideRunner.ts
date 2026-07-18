export interface ExecutionResult {
  stdout: string;
  stderr: string;
  status: "success" | "error";
}

type PendingExecution = {
  resolve: (result: ExecutionResult) => void;
  stdout: string[];
  stderr: string[];
};

/**
 * Main-thread wrapper around the Pyodide Web Worker (public/workers/pyodide.worker.js).
 * Keeps the worker alive across multiple executions (recreating it per run would mean
 * re-downloading/re-initializing the ~10MB WASM runtime every time).
 */
class PyodideRunner {
  private worker: Worker | null = null;
  private pending = new Map<number, PendingExecution>();
  private nextId = 0;

  private getWorker(): Worker {
    if (!this.worker) {
      this.worker = new Worker("/workers/pyodide.worker.js");
      this.worker.onmessage = (event) => this.handleMessage(event.data);
    }
    return this.worker;
  }

  private handleMessage(data: { id: number; type: string; data?: string }) {
    const execution = this.pending.get(data.id);
    if (!execution) return;

    if (data.type === "stdout") {
      execution.stdout.push(data.data ?? "");
    } else if (data.type === "stderr") {
      execution.stderr.push(data.data ?? "");
    } else if (data.type === "done") {
      execution.resolve({
        stdout: execution.stdout.join("\n"),
        stderr: execution.stderr.join("\n"),
        status: "success",
      });
      this.pending.delete(data.id);
    } else if (data.type === "error") {
      execution.resolve({
        stdout: execution.stdout.join("\n"),
        stderr: [...execution.stderr, data.data ?? ""].join("\n"),
        status: "error",
      });
      this.pending.delete(data.id);
    }
  }

  /**
   * Execution timeout mirrors TRD §3.2's "prevent resource exhaustion from infinite loops" —
   * an infinite loop in the worker can't be killed by cancelling a Promise; the worker itself
   * has to be torn down and recreated, which this timeout path does.
   */
  run(code: string, timeoutMs = 10_000): Promise<ExecutionResult> {
    const id = this.nextId++;
    const worker = this.getWorker();

    return new Promise((resolve) => {
      this.pending.set(id, { resolve, stdout: [], stderr: [] });

      const timeout = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          this.worker?.terminate();
          this.worker = null; // force a fresh worker on the next run
          resolve({ stdout: "", stderr: "Execution timed out after 10s", status: "error" });
        }
      }, timeoutMs);

      const originalResolve = this.pending.get(id)!.resolve;
      this.pending.get(id)!.resolve = (result) => {
        clearTimeout(timeout);
        originalResolve(result);
      };

      worker.postMessage({ id, code });
    });
  }

  terminate() {
    this.worker?.terminate();
    this.worker = null;
    this.pending.clear();
  }
}

// Singleton — one Pyodide instance per tab, shared across all CODE blocks in the notebook,
// rather than one per block (which would multiply the ~10MB WASM download).
export const pyodideRunner = new PyodideRunner();
