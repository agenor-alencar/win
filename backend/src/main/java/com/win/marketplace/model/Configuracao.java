package com.win.marketplace.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Entidade que armazena configurações globais do sistema
 */
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "configuracoes")
public class Configuracao {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // === MODELO FINANCEIRO ===
    
    @Column(name = "taxa_comissao_win", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaComissaoWin = new BigDecimal("7.00"); // 7%

    @Column(name = "taxa_repasse_lojista", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaRepasseLojista = new BigDecimal("93.00"); // 93%

    @Column(name = "valor_entrega_motorista", nullable = false, precision = 10, scale = 2)
    private BigDecimal valorEntregaMotorista = new BigDecimal("15.00"); // R$ 15 por entrega

    @Column(name = "taxa_processamento_pagamento", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaProcessamentoPagamento = new BigDecimal("0.20"); // 0.2%

    @Column(name = "dias_repasse", nullable = false)
    private Integer diasRepasse = 2; // D+2

    // ID do recebedor (recipient) do marketplace no Pagar.me para split de pagamento
    @Column(name = "pagarme_recipient_id_marketplace", length = 100)
    private String pagarmeRecipientIdMarketplace;

    // === CONFIGURAÇÕES GERAIS ===
    
    @Column(name = "taxa_entrega_padrao", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaEntregaPadrao = new BigDecimal("8.50");

    @Column(name = "frete_gratis_acima_de", nullable = false, precision = 10, scale = 2)
    private BigDecimal freteGratisAcimaDe = new BigDecimal("150.00");

    @Column(name = "limite_aprovacao_automatica", nullable = false, precision = 10, scale = 2)
    private BigDecimal limiteAprovacaoAutomatica = new BigDecimal("500.00");

    @Column(name = "distancia_maxima_entrega_km", nullable = false)
    private Integer distanciaMaximaEntregaKm = 15;

    @Column(name = "timeout_pedido_minutos", nullable = false)
    private Integer timeoutPedidoMinutos = 30;

    // === ENTREGAS ===
    
    @Column(name = "taxa_entrega_por_km", nullable = false, precision = 10, scale = 2)
    private BigDecimal taxaEntregaPorKm = new BigDecimal("1.20");

    @Column(name = "taxa_comissao_frete", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxaComissaoFrete = new BigDecimal("10.00"); // 10% comissão sobre frete Uber

    @Column(name = "tempo_maximo_entrega_minutos", nullable = false)
    private Integer tempoMaximoEntregaMinutos = 60;

    @Column(name = "auto_atribuir_entrega", nullable = false)
    private Boolean autoAtribuirEntrega = true;

    @Column(name = "permitir_agendamento", nullable = false)
    private Boolean permitirAgendamento = true;

    @Column(name = "horario_inicio", nullable = false, length = 5)
    private String horarioInicio = "08:00";

    @Column(name = "horario_fim", nullable = false, length = 5)
    private String horarioFim = "22:00";

    // === NOTIFICAÇÕES ===
    
    @Column(name = "email_notificacoes", nullable = false)
    private Boolean emailNotificacoes = true;

    @Column(name = "sms_notificacoes", nullable = false)
    private Boolean smsNotificacoes = false;

    @Column(name = "push_notificacoes", nullable = false)
    private Boolean pushNotificacoes = true;

    @Column(name = "confirmar_pedido", nullable = false)
    private Boolean confirmarPedido = true;

    @Column(name = "atualizar_status", nullable = false)
    private Boolean atualizarStatus = true;

    @Column(name = "emails_promocionais", nullable = false)
    private Boolean emailsPromocionais = false;

    @Column(name = "relatorios_semanais", nullable = false)
    private Boolean relatoriosSemanais = true;

    // === SEGURANÇA ===
    
    @Column(name = "autenticacao_dois_fatores", nullable = false)
    private Boolean autenticacaoDoisFatores = false;

    @Column(name = "timeout_sessao_minutos", nullable = false)
    private Integer timeoutSessaoMinutos = 120;

    @Column(name = "max_tentativas_login", nullable = false)
    private Integer maxTentativasLogin = 5;

    @Column(name = "forca_senha", nullable = false, length = 20)
    private String forcaSenha = "medium"; // low, medium, high

    @Column(name = "auditoria_ativa", nullable = false)
    private Boolean auditoriaAtiva = true;

    // === LEGAL ===
    
    @Column(name = "versao_termos", nullable = false, length = 10)
    private String versaoTermos = "1.2";

    @Column(name = "versao_privacidade", nullable = false, length = 10)
    private String versaoPrivacidade = "1.1";

    @Column(name = "politica_cookies", nullable = false)
    private Boolean politicaCookies = true;

    @Column(name = "conformidade_lgpd", nullable = false)
    private Boolean conformidadeLgpd = true;

    @Column(name = "retencao_dados_anos", nullable = false)
    private Integer retencaoDadosAnos = 5;

    @Column(name = "email_contato", nullable = false, length = 255)
    private String emailContato = "suporte@winmarketplace.com";

    // === AUDITORIA ===
    
    @Column(name = "ativo", nullable = false)
    private Boolean ativo = true;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false)
    private OffsetDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "atualizado_em")
    private OffsetDateTime atualizadoEm;

    @Column(name = "atualizado_por", length = 255)
    private String atualizadoPor; // Email do admin que fez a alteração
}
