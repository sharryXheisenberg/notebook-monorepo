package com.notebook.api.exception;

/**
 * Thrown on registration when email/username already exists. Not in the original tree,
 * added because AuthService needs a distinct exception mapping to 409, not the generic 500
 * that an unmapped RuntimeException would fall through to.
 */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
