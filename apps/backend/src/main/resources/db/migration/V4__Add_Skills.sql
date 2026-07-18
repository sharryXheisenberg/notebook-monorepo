-- Skills taxonomy + per-user mastery/streak tracking

CREATE TABLE skills (
    id CHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL,
    CONSTRAINT uq_skills_name UNIQUE (name)
) ENGINE=InnoDB;

CREATE TABLE user_skill_progress (
    id CHAR(36) NOT NULL PRIMARY KEY,
    user_id CHAR(36) NOT NULL,
    skill_id CHAR(36) NOT NULL,
    mastery_level VARCHAR(20) NOT NULL,
    streak_count INT NOT NULL DEFAULT 0,
    last_practiced_at TIMESTAMP NULL,
    CONSTRAINT fk_userskill_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_userskill_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_userskill_user_skill UNIQUE (user_id, skill_id)
) ENGINE=InnoDB;
