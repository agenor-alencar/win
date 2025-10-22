package com.win.marketplace.exception;

/**
 * Exceção lançada quando um recurso não é encontrado no sistema
 * Retorna HTTP 404 - Not Found
 */
public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
    
    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
