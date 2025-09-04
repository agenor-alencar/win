package com.sistemawin.dto.request;

import com.sistemawin.domain.enums.DriverStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {
    @NotBlank(message = "Nome é obrigatório")
    private String name;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email deve ser válido")
    private String email;

    @NotBlank(message = "Senha é obrigatória")
    private String password;

    @NotBlank(message = "Número da licença é obrigatório")
    private String licenseNumber;

    @NotBlank(message = "Tipo de veículo é obrigatório")
    private String vehicleType;

    private DriverStatus status;
}
