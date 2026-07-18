package com.notebook.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfWriter;
import com.notebook.api.dto.response.BlockRes;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.NotebookRepository;
import com.notebook.api.service.BlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.UUID;

/**
 * Handles MD/PDF/JSON export directly to the user (JWT-protected via SecurityConfig's
 * default "anyRequest().authenticated()" rule — no explicit permitAll here).
 *
 * The `toon` format is intentionally NOT served from this controller in production: per
 * HLD §6.5, TOON conversion happens in the Cloudflare Worker, which calls the read-only
 * GET /notebooks/{id}/blocks endpoint directly rather than going through here. It's included
 * here only as a local-dev fallback so you can test the transform without deploying the Worker.
 */
@RestController
@RequiredArgsConstructor
public class ExportController {

    private final NotebookRepository notebookRepository;
    private final BlockService blockService;
    private final ObjectMapper objectMapper;

    @GetMapping("/api/v1/export/{notebookId}")
    public ResponseEntity<byte[]> export(
            @PathVariable UUID notebookId,
            @RequestParam(defaultValue = "json") String format) {

        var notebook = notebookRepository.findById(notebookId)
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found"));
        List<BlockRes> blocks = blockService.listForNotebook(notebookId);

        byte[] fileBytes;
        String filename;
        MediaType mediaType;

        switch (format.toLowerCase()) {
            case "md" -> {
                fileBytes = toMarkdown(notebook.getTitle(), blocks).getBytes(StandardCharsets.UTF_8);
                filename = notebook.getTitle() + ".md";
                mediaType = MediaType.TEXT_MARKDOWN;
            }
            case "pdf" -> {
                fileBytes = toPdf(notebook.getTitle(), blocks);
                filename = notebook.getTitle() + ".pdf";
                mediaType = MediaType.APPLICATION_PDF;
            }
            case "json" -> {
                fileBytes = toJson(notebook.getTitle(), blocks);
                filename = notebook.getTitle() + ".json";
                mediaType = MediaType.APPLICATION_JSON;
            }
            default -> throw new IllegalArgumentException(
                    "Unsupported format: " + format + " (use md, pdf, or json)");
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(filename).build().toString())
                .body(fileBytes);
    }

    private String toMarkdown(String title, List<BlockRes> blocks) {
        StringBuilder sb = new StringBuilder("# ").append(title).append("\n\n");
        for (BlockRes block : blocks) {
            switch (block.blockType()) {
                case TEXT -> sb.append(extractJsonField(block.content(), "markdown")).append("\n\n");
                case CODE -> sb.append("```").append(block.language() == null ? "" : block.language())
                        .append("\n").append(extractJsonField(block.content(), "source"))
                        .append("\n```\n\n");
                default -> sb.append("_[").append(block.blockType()).append(" block omitted from export]_\n\n");
            }
        }
        return sb.toString();
    }

    private byte[] toPdf(String title, List<BlockRes> blocks) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, out);
            document.open();
            document.add(new Paragraph(title));
            document.add(new Paragraph(" "));

            for (BlockRes block : blocks) {
                String text = switch (block.blockType()) {
                    case TEXT -> extractJsonField(block.content(), "markdown");
                    case CODE -> "[" + block.language() + "]\n" + extractJsonField(block.content(), "source");
                    default -> "[" + block.blockType() + " block omitted from export]";
                };
                document.add(new Paragraph(text));
                document.add(new Paragraph(" "));
            }

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF export", e);
        }
    }

    private byte[] toJson(String title, List<BlockRes> blocks) {
        try {
            var payload = new java.util.LinkedHashMap<String, Object>();
            payload.put("title", title);
            payload.put("blocks", blocks);
            return objectMapper.writeValueAsBytes(payload);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate JSON export", e);
        }
    }

    /** Minimal helper since Block.content is stored as a raw JSON string, not a typed object. */
    private String extractJsonField(String jsonContent, String field) {
        try {
            var node = objectMapper.readTree(jsonContent);
            return node.has(field) ? node.get(field).asText() : "";
        } catch (Exception e) {
            return "";
        }
    }
}
