-- Public, read-only share links (no auth required to resolve)

CREATE TABLE share_links (
    id CHAR(36) NOT NULL PRIMARY KEY,
    notebook_id CHAR(36) NOT NULL,
    slug VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NULL,
    view_only BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_sharelinks_notebook FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    CONSTRAINT uq_sharelinks_slug UNIQUE (slug)
) ENGINE=InnoDB;
