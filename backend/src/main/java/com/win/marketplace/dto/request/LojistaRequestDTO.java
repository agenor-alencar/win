package com.win.marketplace.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * DTO para requisição de cadastro de loja (promoção de USER para LOJISTA)
 * 
 * Usado quando um usuário comum decide se tornar um lojista clicando
 * no botão "Venda no WIN" na interface.
 */
public record LojistaRequestDTO(
    
    @NotBlank(message = "Nome fantasia (nome da loja) é obrigatório")
    @Size(min = 3, max = 200, message = "Nome fantasia deve ter entre 3 e 200 caracteres")
    String nomeFantasia,
    
    @NotBlank(message = "Razão social é obrigatória")
    @Size(min = 3, max = 200, message = "Razão social deve ter entre 3 e 200 caracteres")
    String razaoSocial,
    
    @NotBlank(message = "CNPJ é obrigatório")
    @Pattern(regexp = "\\d{14}", message = "CNPJ deve conter exatamente 14 dígitos numéricos")
    String cnpj,
    
    @Size(min = 20, max = 1000, message = "Descrição deve ter entre 20 e 1000 caracteres")
    String descricao,
    
    @Pattern(regexp = "\\(?\\d{2}\\)?\\s?\\d{4,5}-?\\d{4}", message = "Telefone inválido")
    String telefone,
    
    // Campos de Endereço
    @NotBlank(message = "CEP é obrigatório")
    @Pattern(regexp = "\\d{8}", message = "CEP deve conter exatamente 8 dígitos numéricos")
    String cep,
    
    @NotBlank(message = "Logradouro é obrigatório")
    @Size(min = 3, max = 255, message = "Logradouro deve ter entre 3 e 255 caracteres")
    String logradouro,
    
    @NotBlank(message = "Número é obrigatório")
    @Size(max = 10, message = "Número deve ter no máximo 10 caracteres")
    String numero,
    
    @Size(max = 100, message = "Complemento deve ter no máximo 100 caracteres")
    String complemento, // Opcional
    
    @NotBlank(message = "Bairro é obrigatório")
    @Size(min = 2, max = 100, message = "Bairro deve ter entre 2 e 100 caracteres")
    String bairro,
    
    @NotBlank(message = "Cidade é obrigatória")
    @Size(min = 2, max = 100, message = "Cidade deve ter entre 2 e 100 caracteres")
    String cidade,
    
    @NotBlank(message = "UF é obrigatório")
    @Pattern(regexp = "[A-Z]{2}", message = "UF deve ter exatamente 2 letras maiúsculas (ex: SP, RJ)")
    String uf
) {
    /**
     * Construtor de conveniência que normaliza os dados
     */
    public LojistaRequestDTO {
        // Normalizar CNPJ removendo caracteres especiais
        if (cnpj != null) {
            cnpj = cnpj.replaceAll("[^0-9]", "");
        }
        
        // Normalizar telefone removendo caracteres especiais
        if (telefone != null) {
            telefone = telefone.replaceAll("[^0-9]", "");
        }
        
        // Normalizar CEP removendo caracteres especiais
        if (cep != null) {
            cep = cep.replaceAll("[^0-9]", "");
        }
        
        // Normalizar UF para maiúsculas
        if (uf != null) {
            uf = uf.toUpperCase().trim();
        }
    }
}
