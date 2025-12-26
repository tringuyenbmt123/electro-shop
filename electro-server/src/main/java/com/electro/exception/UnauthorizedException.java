package com.electro.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String resource, String field, Object value) {
        super(String.format("Access denied to %s with %s = %s", resource, field, value));
    }
}
