package com.notebook.api.util;

import java.util.regex.Pattern;

/**
 * Small shared validation helpers that don't warrant a full Bean Validation annotation.
 */
public final class ValidationUtil {

    private static final Pattern SLUG_PATTERN = Pattern.compile("^[a-zA-Z0-9]{6,20}$");

    private ValidationUtil() {
        // static helpers only
    }

    public static boolean isValidSlug(String slug) {
        return slug != null && SLUG_PATTERN.matcher(slug).matches();
    }

    public static boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
