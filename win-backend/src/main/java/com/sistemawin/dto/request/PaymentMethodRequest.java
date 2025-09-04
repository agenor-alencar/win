package com.sistemawin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodRequest {
    @NotNull(message = "ID do cliente é obrigatório")
    private Long customerId;

    @NotBlank(message = "Tipo de cartão é obrigatório")
    private String cardType;

    @NotBlank(message = "Últimos 4 dígitos são obrigatórios")
    private String lastFourDigits;

    @NotBlank(message = "Token do cartão é obrigatório")
    private String cardToken;

    @NotNull(message = "Definir como padrão é obrigatório")
    private Boolean isDefault;
}
