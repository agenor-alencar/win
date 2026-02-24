package com.win.marketplace.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ConfiguracaoRequestDTO {

    // === MODELO FINANCEIRO ===
    
    @NotNull(message = "Taxa de comissão WIN é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa de comissão não pode ser negativa")
    @DecimalMax(value = "100.0", message = "Taxa de comissão não pode exceder 100%")
    private BigDecimal taxaComissaoWin;

    @NotNull(message = "Taxa de repasse ao lojista é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa de repasse não pode ser negativa")
    @DecimalMax(value = "100.0", message = "Taxa de repasse não pode exceder 100%")
    private BigDecimal taxaRepasseLojista;

    @NotNull(message = "Valor de entrega para motorista é obrigatório")
    @DecimalMin(value = "0.0", message = "Valor de entrega não pode ser negativo")
    private BigDecimal valorEntregaMotorista;

    @NotNull(message = "Taxa de processamento de pagamento é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa de processamento não pode ser negativa")
    @DecimalMax(value = "10.0", message = "Taxa de processamento não pode exceder 10%")
    private BigDecimal taxaProcessamentoPagamento;

    @NotNull(message = "Dias para repasse é obrigatório")
    @Min(value = 0, message = "Dias para repasse não pode ser negativo")
    @Max(value = 30, message = "Dias para repasse não pode exceder 30")
    private Integer diasRepasse;

    // === CONFIGURAÇÕES GERAIS ===
    
    @NotNull(message = "Taxa de entrega padrão é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa de entrega não pode ser negativa")
    private BigDecimal taxaEntregaPadrao;

    @NotNull(message = "Valor para frete grátis é obrigatório")
    @DecimalMin(value = "0.0", message = "Valor para frete grátis não pode ser negativo")
    private BigDecimal freteGratisAcimaDe;

    @NotNull(message = "Limite de aprovação automática é obrigatório")
    @DecimalMin(value = "0.0", message = "Limite de aprovação não pode ser negativo")
    private BigDecimal limiteAprovacaoAutomatica;

    @NotNull(message = "Distância máxima de entrega é obrigatória")
    @Min(value = 1, message = "Distância máxima deve ser pelo menos 1 km")
    @Max(value = 100, message = "Distância máxima não pode exceder 100 km")
    private Integer distanciaMaximaEntregaKm;

    @NotNull(message = "Timeout de pedido é obrigatório")
    @Min(value = 5, message = "Timeout de pedido deve ser pelo menos 5 minutos")
    @Max(value = 180, message = "Timeout de pedido não pode exceder 180 minutos")
    private Integer timeoutPedidoMinutos;

    // === ENTREGAS ===
    
    @NotNull(message = "Taxa de entrega por km é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa por km não pode ser negativa")
    private BigDecimal taxaEntregaPorKm;

    @NotNull(message = "Taxa de comissão sobre frete é obrigatória")
    @DecimalMin(value = "0.0", message = "Taxa de comissão não pode ser negativa")
    @DecimalMax(value = "50.0", message = "Taxa de comissão não pode exceder 50%")
    private BigDecimal taxaComissaoFrete;

    @NotNull(message = "Tempo máximo de entrega é obrigatório")
    @Min(value = 10, message = "Tempo máximo deve ser pelo menos 10 minutos")
    @Max(value = 240, message = "Tempo máximo não pode exceder 240 minutos")
    private Integer tempoMaximoEntregaMinutos;

    @NotNull(message = "Configuração de auto-atribuição é obrigatória")
    private Boolean autoAtribuirEntrega;

    @NotNull(message = "Configuração de agendamento é obrigatória")
    private Boolean permitirAgendamento;

    @NotNull(message = "Horário de início é obrigatório")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Formato de horário inválido (HH:mm)")
    private String horarioInicio;

    @NotNull(message = "Horário de fim é obrigatório")
    @Pattern(regexp = "^([01]\\d|2[0-3]):([0-5]\\d)$", message = "Formato de horário inválido (HH:mm)")
    private String horarioFim;

    // === NOTIFICAÇÕES ===
    
    @NotNull
    private Boolean emailNotificacoes;
    
    @NotNull
    private Boolean smsNotificacoes;
    
    @NotNull
    private Boolean pushNotificacoes;
    
    @NotNull
    private Boolean confirmarPedido;
    
    @NotNull
    private Boolean atualizarStatus;
    
    @NotNull
    private Boolean emailsPromocionais;
    
    @NotNull
    private Boolean relatoriosSemanais;

    // === SEGURANÇA ===
    
    @NotNull
    private Boolean autenticacaoDoisFatores;
    
    @NotNull
    @Min(value = 30, message = "Timeout de sessão deve ser pelo menos 30 minutos")
    @Max(value = 480, message = "Timeout de sessão não pode exceder 480 minutos")
    private Integer timeoutSessaoMinutos;
    
    @NotNull
    @Min(value = 3, message = "Máximo de tentativas deve ser pelo menos 3")
    @Max(value = 10, message = "Máximo de tentativas não pode exceder 10")
    private Integer maxTentativasLogin;
    
    @NotNull
    @Pattern(regexp = "^(low|medium|high)$", message = "Força de senha deve ser: low, medium ou high")
    private String forcaSenha;
    
    @NotNull
    private Boolean auditoriaAtiva;

    // === LEGAL ===
    
    @NotNull
    @Size(min = 1, max = 10, message = "Versão dos termos deve ter entre 1 e 10 caracteres")
    private String versaoTermos;
    
    @NotNull
    @Size(min = 1, max = 10, message = "Versão da privacidade deve ter entre 1 e 10 caracteres")
    private String versaoPrivacidade;
    
    @NotNull
    private Boolean politicaCookies;
    
    @NotNull
    private Boolean conformidadeLgpd;
    
    @NotNull
    @Min(value = 1, message = "Retenção de dados deve ser pelo menos 1 ano")
    @Max(value = 10, message = "Retenção de dados não pode exceder 10 anos")
    private Integer retencaoDadosAnos;
    
    @NotNull
    @Email(message = "Email de contato inválido")
    private String emailContato;
}
