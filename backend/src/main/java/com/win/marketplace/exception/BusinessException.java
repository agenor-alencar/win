package com.win.marketplace.exception;

/**
 * Exceção lançada para violações de regras de negócio
 * Retorna HTTP 400 - Bad Request
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
