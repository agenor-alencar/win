package com.win.marketplace.dto.response;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * DTO de resposta com dados bancários do lojista
 * Dados sensíveis são mascarados
 */
public record DadosBancariosResponseDTO(
    UUID id,
    UUID lojistaId,
    String titularNome,
    String titularDocumentoMascarado, // CPF/CNPJ mascarado
    String titularTipo,
    String codigoBanco,
    String nomeBanco, // Nome do banco para exibição
    String agenciaMascarada, // Agência mascarada (últimos 2 dígitos)
    String contaMascarada, // Conta mascarada (últimos 4 dígitos)
    String tipoConta,
    Boolean validado, // Se a conta foi validada no Pagar.me
    Boolean recipientCriado, // Se o recipient foi criado no Pagar.me
    OffsetDateTime criadoEm,
    OffsetDateTime atualizadoEm
) {
    
    /**
     * Mascara CPF: 123.456.789-00 -> ***.***.789-**
     */
    public static String mascaraCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) return cpf;
        return "***.***.***-" + cpf.substring(9);
    }
    
    
    public static String mascaraCnpj(String cnpj) {
        if (cnpj == null || cnpj.length() != 14) return cnpj;
        return "**.***.***/" + cnpj.substring(8, 12) + "-**";
    }
    
    /**
     * Mascara agência: 1234 -> **34
     */
    public static String mascaraAgencia(String agencia, String agenciaDv) {
        if (agencia == null || agencia.length() < 2) return agencia;
        String ult2 = agencia.substring(agencia.length() - 2);
        return "**" + ult2 + (agenciaDv != null ? "-" + agenciaDv : "");
    }
    
    /**
     * Mascara conta: 12345-6 -> ****5-6
     */
    public static String mascaraConta(String conta, String contaDv) {
        if (conta == null || conta.length() < 1) return conta;
        String ult = conta.substring(conta.length() - 1);
        return "****" + ult + "-" + (contaDv != null ? contaDv : "");
    }
    
    /**
     * Retorna nome do banco pelo código
     */
    public static String getNomeBanco(String codigo) {
        return switch (codigo) {
            case "001" -> "Banco do Brasil";
            case "033" -> "Santander";
            case "104" -> "Caixa Econômica";
            case "237" -> "Bradesco";
            case "341" -> "Itaú";
            case "077" -> "Inter";
            case "260" -> "Nubank";
            case "290" -> "PagBank";
            case "336" -> "C6 Bank";
            case "422" -> "Safra";
            default -> "Banco " + codigo;
        };
    }
}
