package com.sistemawin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {
    @NotNull(message = "ID do cliente é obrigatório")
    private Long customerId;

    private Long driverId; // Opcional, pode ser atribuído depois

    @NotEmpty(message = "O pedido deve conter pelo menos um item")
    private List<OrderItemRequest> items;

    @NotBlank(message = "Endereço de entrega é obrigatório")
    private String deliveryAddress;
}
