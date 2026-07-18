-- Core schema: users, notebooks, blocks, code_reviews
-- UUIDs stored as CHAR(36); MySQL has no native UUID type.

CREATE TABLE users (
    id CHAR(36) NOT NULL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB;

CREATE TABLE notebooks (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    parent_folder_id CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_notebooks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_notebooks_parent FOREIGN KEY (parent_folder_id) REFERENCES notebooks(id) ON DELETE SET NULL,
    INDEX idx_notebooks_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE blocks (
    id CHAR(36) NOT NULL PRIMARY KEY,
    notebook_id CHAR(36) NOT NULL,
    block_type VARCHAR(20) NOT NULL,
    content JSON NOT NULL,
    order_index INT NOT NULL,
    language VARCHAR(30) NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_blocks_notebook FOREIGN KEY (notebook_id) REFERENCES notebooks(id) ON DELETE CASCADE,
    INDEX idx_blocks_notebook_order (notebook_id, order_index)
) ENGINE=InnoDB;

CREATE TABLE code_reviews (
    id CHAR(36) NOT NULL PRIMARY KEY,
    block_id CHAR(36) NOT NULL,
    line_number INT NOT NULL,
    suggestion_text TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_codereviews_block FOREIGN KEY (block_id) REFERENCES blocks(id) ON DELETE CASCADE,
    INDEX idx_codereviews_block (block_id)
) ENGINE=InnoDB;
