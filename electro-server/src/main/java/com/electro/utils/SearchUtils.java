package com.electro.utils;

import org.springframework.data.jpa.domain.Specification;

import javax.persistence.criteria.Path;
import javax.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class SearchUtils {

    /**
     * Safe search implementation using JPA Criteria API to prevent RSQL injection
     * @param search The search keyword
     * @param searchFields List of fields to search in (supports nested fields like "user.username")
     * @return Specification with safe parameterized queries
     */
    public static <T> Specification<T> parse(String search, List<String> searchFields) {
        return (root, query, cb) -> {
            // Return no filter if search is empty
            if (search == null || search.isBlank() || searchFields == null || searchFields.isEmpty()) {
                return cb.conjunction();
            }

            // Trim and validate search input
            String keyword = search.trim();
            
            // Limit search length to prevent abuse
            if (keyword.length() > 100) {
                throw new IllegalArgumentException("Search keyword is too long (max 100 characters)");
            }

            // Escape LIKE wildcards to prevent pattern injection
            String escapedKeyword = escapeLike(keyword);
            String likePattern = "%" + escapedKeyword.toLowerCase() + "%";

            // Build OR predicates for all search fields using parameterized queries
            List<Predicate> predicates = new ArrayList<>();
            for (String field : searchFields) {
                try {
                    Path<String> path = getNestedPath(root, field);
                    // Use parameterized LIKE query with proper escaping
                    predicates.add(cb.like(cb.lower(path.as(String.class)), likePattern, '\\'));
                } catch (Exception e) {
                    // Skip invalid fields silently to avoid breaking the query
                    continue;
                }
            }

            // Return OR of all predicates
            if (predicates.isEmpty()) {
                return cb.conjunction();
            }
            return cb.or(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Escape LIKE wildcards to prevent pattern injection
     * @param input The user input string
     * @return Escaped string
     */
    private static String escapeLike(String input) {
        return input
                .replace("\\", "\\\\")  // Escape backslash
                .replace("%", "\\%")     // Escape percent
                .replace("_", "\\_");    // Escape underscore
    }

    /**
     * Get nested path for fields like "user.username"
     * @param root Root path
     * @param field Field path (can be nested with dots)
     * @return The nested path
     */
    private static <T> Path<String> getNestedPath(javax.persistence.criteria.Root<T> root, String field) {
        String[] parts = field.split("\\.");
        Path<String> path = root.get(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            path = path.get(parts[i]);
        }
        return path;
    }

}

