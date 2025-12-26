package com.electro.exception;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.dao.InvalidDataAccessApiUsageException;

import java.time.Instant;

@RestControllerAdvice
public class ApplicationExceptionHandler {
    // ===================== 400 BAD REQUEST =====================
    @ExceptionHandler({
            IllegalArgumentException.class,
            InvalidDataAccessApiUsageException.class
    })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErrorMessage handleBadRequest(Exception ex, WebRequest request) {
        return new ErrorMessage(
                HttpStatus.BAD_REQUEST.value(),
                Instant.now(),
                "Invalid search keyword",
                request.getDescription(false)
        );
    }

    // ===================== 401 UNAUTHORIZED =====================
    @ExceptionHandler({
            AuthenticationException.class,
            VerificationException.class,
            ExpiredTokenException.class
    })
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorMessage handleUnauthorized(Exception ex, WebRequest request) {
        return new ErrorMessage(
                HttpStatus.UNAUTHORIZED.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    // ===================== 403 FORBIDDEN =====================
    @ExceptionHandler({
            AccessDeniedException.class,
            RefreshTokenException.class
    })
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorMessage handleForbidden(Exception ex, WebRequest request) {
        return new ErrorMessage(
                HttpStatus.FORBIDDEN.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    // ===================== 404 NOT FOUND =====================
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErrorMessage handleNotFound(ResourceNotFoundException ex, WebRequest request) {
        return new ErrorMessage(
                HttpStatus.NOT_FOUND.value(),
                Instant.now(),
                ex.getMessage(),
                request.getDescription(false)
        );
    }

    // ===================== 500 INTERNAL SERVER ERROR =====================
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorMessage handleGlobal(Exception ex, WebRequest request) {
        return new ErrorMessage(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                Instant.now(),
                "Internal server error",
                request.getDescription(false)
        );
    }
}