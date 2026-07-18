-- Threaded comments on a code review (GitHub PR-style discussion per flagged line)

CREATE TABLE review_comments (
    id CHAR(36) NOT NULL PRIMARY KEY,
    code_review_id CHAR(36) NOT NULL,
    author_id CHAR(36) NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_reviewcomments_review FOREIGN KEY (code_review_id) REFERENCES code_reviews(id) ON DELETE CASCADE,
    CONSTRAINT fk_reviewcomments_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_reviewcomments_review (code_review_id)
) ENGINE=InnoDB;
