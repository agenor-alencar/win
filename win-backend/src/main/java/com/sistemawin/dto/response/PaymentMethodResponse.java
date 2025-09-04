package com.sistemawin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodResponse {
    private Long id;
    private Long customerId;
    private String cardType;
    private String lastFourDigits;
    private Boolean isDefault;
    private LocalDateTime createdAt;
}
