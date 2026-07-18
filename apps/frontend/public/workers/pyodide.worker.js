// Runs inside a Web Worker — never the main thread, per TRD §5 sandboxing rules.
// Loaded via importScripts from the CDN rather than bundled, since Pyodide's ~10MB
// WASM payload shouldn't bloat the Next.js bundle; it's fetched once and cached by the browser.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

let pyodideReadyPromise = null;

async function initPyodide() {
  if (!pyodideReadyPromise) {
    pyodideReadyPromise = loadPyodide();
  }
  return pyodideReadyPromise;
}

self.onmessage = async (event) => {
  const { id, code } = event.data;

  try {
    const pyodide = await initPyodide();

    // Redirect Python's stdout/stderr into strings we can send back, rather than
    // letting Pyodide print to the worker's own console where the UI can't see it.
    pyodide.setStdout({ batched: (msg) => self.postMessage({ id, type: "stdout", data: msg }) });
    pyodide.setStderr({ batched: (msg) => self.postMessage({ id, type: "stderr", data: msg }) });

    await pyodide.runPythonAsync(code);

    self.postMessage({ id, type: "done" });
  } catch (error) {
    self.postMessage({ id, type: "error", data: String(error) });
  }
};
