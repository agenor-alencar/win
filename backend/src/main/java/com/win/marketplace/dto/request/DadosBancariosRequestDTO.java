package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para cadastro/atualização de dados bancários do lojista
 */
public record DadosBancariosRequestDTO(
    
    @NotBlank(message = "Nome do titular é obrigatório")
    @Size(max = 200, message = "Nome do titular deve ter no máximo 200 caracteres")
    String titularNome,
    
    @NotBlank(message = "Documento do titular é obrigatório")
    @Pattern(regexp = "\\d{11}|\\d{14}", message = "Documento deve ser CPF (11 dígitos) ou CNPJ (14 dígitos)")
    String titularDocumento,
    
    @NotBlank(message = "Tipo do titular é obrigatório")
    @Pattern(regexp = "individual|company", message = "Tipo deve ser 'individual' ou 'company'")
    String titularTipo,
    
    @NotBlank(message = "Código do banco é obrigatório")
    @Pattern(regexp = "\\d{3}", message = "Código do banco deve ter 3 dígitos")
    String codigoBanco,
    
    @NotBlank(message = "Agência é obrigatória")
    @Size(max = 10, message = "Agência deve ter no máximo 10 caracteres")
    String agencia,
    
    @Size(max = 1, message = "Dígito verificador da agência deve ter 1 caractere")
    String agenciaDv,
    
    @NotBlank(message = "Conta é obrigatória")
    @Size(max = 20, message = "Conta deve ter no máximo 20 caracteres")
    String conta,
    
    @NotBlank(message = "Dígito verificador da conta é obrigatório")
    @Size(max = 2, message = "Dígito verificador da conta deve ter no máximo 2 caracteres")
    String contaDv,
    
    @NotBlank(message = "Tipo de conta é obrigatório")
    @Pattern(regexp = "conta_corrente|conta_poupanca", message = "Tipo deve ser 'conta_corrente' ou 'conta_poupanca'")
    String tipoConta
) {}
