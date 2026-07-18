package com.notebook.api.util;

/**
 * Block types supported by the editor. Extended from the original MVP (TEXT, CODE, AI_PROMPT)
 * per TRD v2 / LLD to include REVIEW and DIAGRAM.
 */
public enum BlockTypeEnum {
    TEXT,
    CODE,
    AI_PROMPT,
    REVIEW,
    DIAGRAM
}
