package com.notebook.api.service;

import com.notebook.api.dto.mapper.BlockMapper;
import com.notebook.api.dto.request.CreateShareReq;
import com.notebook.api.dto.response.PublicNotebookRes;
import com.notebook.api.entity.Notebook;
import com.notebook.api.entity.ShareLink;
import com.notebook.api.exception.ResourceNotFoundException;
import com.notebook.api.repository.BlockRepository;
import com.notebook.api.repository.NotebookRepository;
import com.notebook.api.repository.ShareLinkRepository;
import com.notebook.api.service.impl.ShareServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShareServiceImplTest {

    @Mock private ShareLinkRepository shareLinkRepository;
    @Mock private NotebookRepository notebookRepository;
    @Mock private BlockRepository blockRepository;
    @Mock private BlockMapper blockMapper;

    @InjectMocks
    private ShareServiceImpl shareService;

    @Test
    void resolve_throwsResourceNotFound_whenSlugDoesNotExist() {
        ReflectionTestUtils.setField(shareService, "frontendBaseUrl", "http://localhost:3000");
        when(shareLinkRepository.findBySlug("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shareService.resolve("nope"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void resolve_throwsResourceNotFound_whenLinkIsExpired_notADifferentException() {
        // Deliberately checking this returns the SAME exception type as "not found" —
        // an anonymous viewer shouldn't be able to distinguish expired from nonexistent.
        ShareLink expiredLink = ShareLink.builder()
                .notebookId(UUID.randomUUID())
                .slug("abc12345")
                .expiresAt(Instant.now().minus(1, ChronoUnit.DAYS))
                .build();
        when(shareLinkRepository.findBySlug("abc12345")).thenReturn(Optional.of(expiredLink));

        assertThatThrownBy(() -> shareService.resolve("abc12345"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void resolve_succeeds_forValidNonExpiredLink() {
        UUID notebookId = UUID.randomUUID();
        ShareLink link = ShareLink.builder()
                .notebookId(notebookId)
                .slug("valid123")
                .expiresAt(null) // never expires
                .build();
        Notebook notebook = Notebook.builder().id(notebookId).title("My Notebook").build();

        when(shareLinkRepository.findBySlug("valid123")).thenReturn(Optional.of(link));
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.of(notebook));
        when(blockRepository.findByNotebookIdOrderByOrderIndexAsc(notebookId))
                .thenReturn(Collections.emptyList());

        PublicNotebookRes result = shareService.resolve("valid123");

        assertThat(result.title()).isEqualTo("My Notebook");
        assertThat(result.blocks()).isEmpty();
    }

    @Test
    void createLink_throwsResourceNotFound_whenNotebookDoesNotExist() {
        UUID notebookId = UUID.randomUUID();
        when(notebookRepository.findById(notebookId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shareService.createLink(notebookId, new CreateShareReq(null)))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
