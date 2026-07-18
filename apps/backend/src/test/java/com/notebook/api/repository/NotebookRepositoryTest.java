package com.notebook.api.repository;

import com.notebook.api.entity.Notebook;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
class NotebookRepositoryTest {

    @Autowired
    private NotebookRepository notebookRepository;

    @Test
    void findByUserIdOrderByCreatedAtDesc_returnsOnlyThatUsersNotebooks() {
        UUID userA = UUID.randomUUID();
        UUID userB = UUID.randomUUID();

        notebookRepository.save(Notebook.builder().userId(userA).title("A's first").build());
        notebookRepository.save(Notebook.builder().userId(userA).title("A's second").build());
        notebookRepository.save(Notebook.builder().userId(userB).title("B's notebook").build());

        List<Notebook> result = notebookRepository.findByUserIdOrderByCreatedAtDesc(userA);

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(n -> n.getUserId().equals(userA));
    }

    @Test
    void createdAtAndUpdatedAt_arePopulatedOnSave() {
        Notebook saved = notebookRepository.save(
                Notebook.builder().userId(UUID.randomUUID()).title("Timestamps").build());

        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getCreatedAt()).isBeforeOrEqualTo(Instant.now());
    }
}
