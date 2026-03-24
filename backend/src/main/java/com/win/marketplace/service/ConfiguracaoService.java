package com.win.marketplace.service;

import com.win.marketplace.dto.request.ConfiguracaoRequestDTO;
import com.win.marketplace.dto.response.ConfiguracaoResponseDTO;

import com.win.marketplace.model.Configuracao;
import com.win.marketplace.repository.ConfiguracaoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service para gerenciar configurações do sistema
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConfiguracaoService {

    private final ConfiguracaoRepository configuracaoRepository;

    /**
     * Busca as configurações ativas do sistema
     * Se não existir, cria uma configuração padrão
     */
    @Transactional(readOnly = true)
    public ConfiguracaoResponseDTO buscarConfigAtiva() {
        log.info("Buscando configurações ativas do sistema");
        
        Configuracao config = configuracaoRepository.findConfigAtiva()
                .orElseGet(this::criarConfiguracaoPadrao);
        
        return ConfiguracaoResponseDTO.fromEntity(config);
    }

    /**
     * Atualiza as configurações do sistema
     */
    @Transactional
    public ConfiguracaoResponseDTO atualizarConfig(ConfiguracaoRequestDTO dto, String emailAdmin) {
        log.info("Atualizando configurações do sistema por: {}", emailAdmin);
        
        // Buscar config ativa ou criar nova
        Configuracao config = configuracaoRepository.findConfigAtiva()
                .orElseGet(Configuracao::new);

        // Validar que comissão + repasse = 100%
        if (dto.getTaxaComissaoWin().add(dto.getTaxaRepasseLojista()).compareTo(new java.math.BigDecimal("100.00")) != 0) {
            throw new IllegalArgumentException("A soma da comissão WIN e repasse ao lojista deve ser 100%");
        }

        // Atualizar modelo financeiro
        config.setTaxaComissaoWin(dto.getTaxaComissaoWin());
        config.setTaxaRepasseLojista(dto.getTaxaRepasseLojista());
        config.setValorEntregaMotorista(dto.getValorEntregaMotorista());
        config.setTaxaProcessamentoPagamento(dto.getTaxaProcessamentoPagamento());
        config.setDiasRepasse(dto.getDiasRepasse());

        // Atualizar configurações gerais
        config.setTaxaEntregaPadrao(dto.getTaxaEntregaPadrao());
        config.setFreteGratisAcimaDe(dto.getFreteGratisAcimaDe());
        config.setLimiteAprovacaoAutomatica(dto.getLimiteAprovacaoAutomatica());
        config.setDistanciaMaximaEntregaKm(dto.getDistanciaMaximaEntregaKm());
        config.setTimeoutPedidoMinutos(dto.getTimeoutPedidoMinutos());

        // Atualizar entregas
        config.setTaxaEntregaPorKm(dto.getTaxaEntregaPorKm());
        config.setTaxaComissaoFrete(dto.getTaxaComissaoFrete());
        config.setTempoMaximoEntregaMinutos(dto.getTempoMaximoEntregaMinutos());
        config.setAutoAtribuirEntrega(dto.getAutoAtribuirEntrega());
        config.setPermitirAgendamento(dto.getPermitirAgendamento());
        config.setHorarioInicio(dto.getHorarioInicio());
        config.setHorarioFim(dto.getHorarioFim());

        // Atualizar notificações
        config.setEmailNotificacoes(dto.getEmailNotificacoes());
        config.setSmsNotificacoes(dto.getSmsNotificacoes());
        config.setPushNotificacoes(dto.getPushNotificacoes());
        config.setConfirmarPedido(dto.getConfirmarPedido());
        config.setAtualizarStatus(dto.getAtualizarStatus());
        config.setEmailsPromocionais(dto.getEmailsPromocionais());
        config.setRelatoriosSemanais(dto.getRelatoriosSemanais());

        // Atualizar segurança
        config.setAutenticacaoDoisFatores(dto.getAutenticacaoDoisFatores());
        config.setTimeoutSessaoMinutos(dto.getTimeoutSessaoMinutos());
        config.setMaxTentativasLogin(dto.getMaxTentativasLogin());
        config.setForcaSenha(dto.getForcaSenha());
        config.setAuditoriaAtiva(dto.getAuditoriaAtiva());

        // Atualizar legal
        config.setVersaoTermos(dto.getVersaoTermos());
        config.setVersaoPrivacidade(dto.getVersaoPrivacidade());
        config.setPoliticaCookies(dto.getPoliticaCookies());
        config.setConformidadeLgpd(dto.getConformidadeLgpd());
        config.setRetencaoDadosAnos(dto.getRetencaoDadosAnos());
        config.setEmailContato(dto.getEmailContato());

        // Auditoria
        config.setAtivo(true);
        config.setAtualizadoPor(emailAdmin);

        Configuracao configSalva = configuracaoRepository.save(config);
        
        log.info("Configurações atualizadas com sucesso. ID: {}", configSalva.getId());
        
        return ConfiguracaoResponseDTO.fromEntity(configSalva);
    }

    /**
     * Restaura configurações para valores padrão
     */
    @Transactional
    public ConfiguracaoResponseDTO restaurarPadrao(String emailAdmin) {
        log.info("Restaurando configurações para padrão por: {}", emailAdmin);
        
        // Desativar config atual se existir
        configuracaoRepository.findConfigAtiva().ifPresent(config -> {
            config.setAtivo(false);
            configuracaoRepository.save(config);
        });

        // Criar nova config padrão
        Configuracao configPadrao = criarConfiguracaoPadrao();
        configPadrao.setAtualizadoPor(emailAdmin);
        
        Configuracao configSalva = configuracaoRepository.save(configPadrao);
        
        log.info("Configurações padrão restauradas. ID: {}", configSalva.getId());
        
        return ConfiguracaoResponseDTO.fromEntity(configSalva);
    }

    /**
     * Cria uma configuração com valores padrão
     */
    private Configuracao criarConfiguracaoPadrao() {
        log.info("Criando configuração padrão do sistema");
        
        Configuracao config = new Configuracao();
        // Os valores padrão já estão definidos na entidade
        config.setAtivo(true);
        
        return configuracaoRepository.save(config);
    }

    /**
     * Busca configuração para uso interno do sistema
     */
    @Transactional(readOnly = true)
    public Configuracao buscarConfigInterna() {
        return configuracaoRepository.findConfigAtiva()
                .orElseGet(this::criarConfiguracaoPadrao);
    }
}
