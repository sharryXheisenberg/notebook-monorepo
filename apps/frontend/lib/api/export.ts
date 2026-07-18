import { apiRequestBlob } from "./client";

export type ExportFormat = "md" | "pdf" | "json";

export async function downloadExport(notebookId: string, format: ExportFormat, filename: string) {
  const blob = await apiRequestBlob(`/export/${notebookId}?format=${format}`);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
