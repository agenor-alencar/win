package com.win.marketplace.config;

import com.win.marketplace.service.UberAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Agendador para tarefas relacionadas à Uber Direct
 * 
 * Executa limpezas e renovações automáticas de tokens
 */
@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class UberSchedulerConfig {

    private final UberAuthService uberAuthService;

    /**
     * Limpa tokens expirados a cada 12 horas
     * Execução:
     * - 01:00 AM
     * - 01:00 PM
     */
    @Scheduled(cron = "0 0 1,13 * * *")  // 1 AM e 1 PM todos os dias
    public void limparTokensExpiradosAgendado() {
        try {
            log.info("⏰ Executando limpeza de tokens expirados (agendado)...");
            uberAuthService.limparTokensExpirados();
        } catch (Exception e) {
            log.error("❌ Erro ao limpar tokens expirados: {}", e.getMessage(), e);
        }
    }

    /**
     * Valida configuração da Uber ao iniciar aplicação
     */
    @Scheduled(initialDelayString = "${scheduler.initial-delay:5000}", fixedDelayString = "${scheduler.fixed-delay:86400000}")
    public void validarConfiguracaoUber() {
        try {
            log.info("🔍 Validando configuração da Uber Direct...");
            Boolean valido = uberAuthService.validarConfiguracao();
            
            if (valido) {
                log.info("✅ Configuração da Uber está correta");
            } else {
                log.error("❌ Configuração da Uber está incompleta ou inválida");
            }
        } catch (Exception e) {
            log.error("❌ Erro ao validar configuração: {}", e.getMessage(), e);
        }
    }
}
