package com.win.marketplace.dto.response;

import com.win.marketplace.model.Configuracao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracaoResponseDTO {

    private UUID id;

    // === MODELO FINANCEIRO ===
    private BigDecimal taxaComissaoWin;
    private BigDecimal taxaRepasseLojista;
    private BigDecimal valorEntregaMotorista;
    private BigDecimal taxaProcessamentoPagamento;
    private Integer diasRepasse;

    // === CONFIGURAÇÕES GERAIS ===
    private BigDecimal taxaEntregaPadrao;
    private BigDecimal freteGratisAcimaDe;
    private BigDecimal limiteAprovacaoAutomatica;
    private Integer distanciaMaximaEntregaKm;
    private Integer timeoutPedidoMinutos;

    // === ENTREGAS ===
    private BigDecimal taxaEntregaPorKm;
    private BigDecimal taxaComissaoFrete;
    private Integer tempoMaximoEntregaMinutos;
    private Boolean autoAtribuirEntrega;
    private Boolean permitirAgendamento;
    private String horarioInicio;
    private String horarioFim;

    // === NOTIFICAÇÕES ===
    private Boolean emailNotificacoes;
    private Boolean smsNotificacoes;
    private Boolean pushNotificacoes;
    private Boolean confirmarPedido;
    private Boolean atualizarStatus;
    private Boolean emailsPromocionais;
    private Boolean relatoriosSemanais;

    // === SEGURANÇA ===
    private Boolean autenticacaoDoisFatores;
    private Integer timeoutSessaoMinutos;
    private Integer maxTentativasLogin;
    private String forcaSenha;
    private Boolean auditoriaAtiva;

    // === LEGAL ===
    private String versaoTermos;
    private String versaoPrivacidade;
    private Boolean politicaCookies;
    private Boolean conformidadeLgpd;
    private Integer retencaoDadosAnos;
    private String emailContato;

    // === AUDITORIA ===
    private Boolean ativo;
    private OffsetDateTime criadoEm;
    private OffsetDateTime atualizadoEm;
    private String atualizadoPor;

    public static ConfiguracaoResponseDTO fromEntity(Configuracao config) {
        return ConfiguracaoResponseDTO.builder()
                .id(config.getId())
                .taxaComissaoWin(config.getTaxaComissaoWin())
                .taxaRepasseLojista(config.getTaxaRepasseLojista())
                .valorEntregaMotorista(config.getValorEntregaMotorista())
                .taxaProcessamentoPagamento(config.getTaxaProcessamentoPagamento())
                .diasRepasse(config.getDiasRepasse())
                .taxaEntregaPadrao(config.getTaxaEntregaPadrao())
                .freteGratisAcimaDe(config.getFreteGratisAcimaDe())
                .limiteAprovacaoAutomatica(config.getLimiteAprovacaoAutomatica())
                .distanciaMaximaEntregaKm(config.getDistanciaMaximaEntregaKm())
                .timeoutPedidoMinutos(config.getTimeoutPedidoMinutos())
                .taxaEntregaPorKm(config.getTaxaEntregaPorKm())
                .taxaComissaoFrete(config.getTaxaComissaoFrete())
                .tempoMaximoEntregaMinutos(config.getTempoMaximoEntregaMinutos())
                .autoAtribuirEntrega(config.getAutoAtribuirEntrega())
                .permitirAgendamento(config.getPermitirAgendamento())
                .horarioInicio(config.getHorarioInicio())
                .horarioFim(config.getHorarioFim())
                .emailNotificacoes(config.getEmailNotificacoes())
                .smsNotificacoes(config.getSmsNotificacoes())
                .pushNotificacoes(config.getPushNotificacoes())
                .confirmarPedido(config.getConfirmarPedido())
                .atualizarStatus(config.getAtualizarStatus())
                .emailsPromocionais(config.getEmailsPromocionais())
                .relatoriosSemanais(config.getRelatoriosSemanais())
                .autenticacaoDoisFatores(config.getAutenticacaoDoisFatores())
                .timeoutSessaoMinutos(config.getTimeoutSessaoMinutos())
                .maxTentativasLogin(config.getMaxTentativasLogin())
                .forcaSenha(config.getForcaSenha())
                .auditoriaAtiva(config.getAuditoriaAtiva())
                .versaoTermos(config.getVersaoTermos())
                .versaoPrivacidade(config.getVersaoPrivacidade())
                .politicaCookies(config.getPoliticaCookies())
                .conformidadeLgpd(config.getConformidadeLgpd())
                .retencaoDadosAnos(config.getRetencaoDadosAnos())
                .emailContato(config.getEmailContato())
                .ativo(config.getAtivo())
                .criadoEm(config.getCriadoEm())
                .atualizadoEm(config.getAtualizadoEm())
                .atualizadoPor(config.getAtualizadoPor())
                .build();
    }
}
