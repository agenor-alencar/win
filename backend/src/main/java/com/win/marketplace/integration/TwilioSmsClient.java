package com.win.marketplace.integration;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.Base64;

/**
 * Cliente de integração com API SMS Twilio
 * 
 * Responsabilidades:
 * - Autenticar com Twilio usando Account SID e Auth Token
 * - Enviar SMS com código OTP para número de telefone
 * - Tratar erros da API Twilio
 * - Fazer retry em caso de falha temporária (503, 429)
 * 
 * Documentação: https://www.twilio.com/docs/sms/api
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TwilioSmsClient {

    private final RestTemplate restTemplate;

    @Value("${twilio.account-sid:}")
    private String accountSid;

    @Value("${twilio.auth-token:}")
    private String authToken;

    @Value("${twilio.phone-number:}")
    private String fromPhoneNumber;

    @Value("${twilio.enabled:true}")
    private Boolean twilioEnabled;

    private static final String TWILIO_API_URL = "https://api.twilio.com/2010-04-01/Accounts/{accountSid}/Messages.json";
    private static final int MAX_RETRIES = 3;
    private static final int RETRY_DELAY_MS = 1000;

    /**
     * Envia um SMS com código OTP para um número de telefone
     * 
     * Fluxo:
     * 1. Validar configuração Twilio
     * 2. Montar requisição HTTP para API Twilio
     * 3. Fazer autenticação básica (Account SID + Auth Token em Base64)
     * 4. Enviar SMS com retry em caso de falha
     * 5. Tratar erros apropriadamente
     * 
     * @param telefone Número de telefone no formato internacional (+55 + DDD + número)
     * @param codigoOtp Código OTP de 6 dígitos
     * @return true se SMS foi enviado com sucesso
     * @throws ResponseStatusException (503) se Twilio está indisponível
     * @throws ResponseStatusException (500) se erro ao enviar SMS
     */
    public boolean enviarSmsComCodigoOtp(String telefone, String codigoOtp) {
        // Se Twilio está desabilitado, simular envio bem-sucedido (dev/test)
        if (!twilioEnabled) {
            log.info("Twilio desabilitado - SMS simulado para {}: {}", telefone, codigoOtp);
            return true;
        }

        // Validar configuração apenas se Twilio estiver habilitado
        validarConfiguracao();

        String messageBody = String.format(
                "Seu código de verificação WIN é: %s (válido por 5 minutos)",
                codigoOtp
        );

        return enviarComRetry(telefone, messageBody, 0);
    }

    /**
     * Envia SMS com retry automático em caso de falha temporária
     * 
     * @param telefone Número de telefone
     * @param mensagem Corpo da mensagem
     * @param tentativa Número da tentativa atual (0 = primeira)
     * @return true se enviado com sucesso
     * @throws ResponseStatusException se falha após todas as tentativas
     */
    private boolean enviarComRetry(String telefone, String mensagem, int tentativa) {
        try {
            log.debug("Enviando SMS para {} - tentativa {}", telefone, tentativa + 1);

            HttpHeaders headers = construirHeaders();
            MultiValueMap<String, String> body = construirCorpoRequisicao(telefone, mensagem);

            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);
            String url = TWILIO_API_URL.replace("{accountSid}", accountSid);

            restTemplate.postForObject(url, requestEntity, String.class);

            log.info("SMS enviado com sucesso para {}", telefone);
            return true;

        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            // 429 - Rate limit - retry com backoff exponencial
            if (tentativa < MAX_RETRIES) {
                log.warn("Rate limit Twilio (429) - fazendo retry em {}ms", RETRY_DELAY_MS * (tentativa + 1));
                aguardar(RETRY_DELAY_MS * (tentativa + 1));
                return enviarComRetry(telefone, mensagem, tentativa + 1);
            }
            log.error("Falha ao enviar SMS após {} tentativas - Rate limit atingido", MAX_RETRIES);
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Muitas solicitações. Tente novamente em alguns minutos"
            );

        } catch (org.springframework.web.client.HttpServerErrorException.ServiceUnavailable e) {
            // 503 - Serviço indisponível - retry
            if (tentativa < MAX_RETRIES) {
                log.warn("Twilio indisponível (503) - fazendo retry em {}ms", RETRY_DELAY_MS * (tentativa + 1));
                aguardar(RETRY_DELAY_MS * (tentativa + 1));
                return enviarComRetry(telefone, mensagem, tentativa + 1);
            }
            log.error("Falha ao enviar SMS - Twilio indisponível após {} tentativas", MAX_RETRIES);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Serviço de SMS indisponível. Tente novamente em alguns minutos"
            );

        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Erro 4xx - erro do cliente (telefone inválido, etc)
            log.error("Erro ao enviar SMS para {} - Erro {}:{}", telefone, e.getStatusCode(), e.getStatusText());
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Número de telefone inválido ou não suportado"
            );

        } catch (Exception e) {
            // Erro genérico
            log.error("Erro inesperado ao enviar SMS para {}: {}", telefone, e.getMessage(), e);
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Erro ao enviar SMS. Tente novamente em alguns minutos"
            );
        }
    }

    /**
     * Constrói headers HTTP com autenticação básica Base64
     * 
     * @return HttpHeaders configurado
     */
    private HttpHeaders construirHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        // Autenticação básica: Account SID:Auth Token em Base64
        String auth = accountSid + ":" + authToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        return headers;
    }

    /**
     * Constrói corpo da requisição para API Twilio
     * 
     * Parâmetros obrigatórios:
     * - From: número de telefone do remetente (configurado)
     * - To: número de telefone do destinatário
     * - Body: corpo da mensagem SMS
     * 
     * @param telefone Número de telefone destino
     * @param mensagem Corpo da mensagem
     * @return Map com parâmetros da requisição
     */
    private MultiValueMap<String, String> construirCorpoRequisicao(String telefone, String mensagem) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("From", fromPhoneNumber);
        body.add("To", telefone);
        body.add("Body", mensagem);
        return body;
    }

    /**
     * Valida se a configuração Twilio está completa
     * 
     * @throws ResponseStatusException se Twilio não está configurado
     */
    private void validarConfiguracao() {
        if (accountSid == null || accountSid.isBlank() ||
                authToken == null || authToken.isBlank() ||
                fromPhoneNumber == null || fromPhoneNumber.isBlank()) {

            log.error("Configuração Twilio incompleta");
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Serviço de SMS não configurado. Contate o suporte"
            );
        }
    }

    /**
     * Helper para aguardar (usado no retry)
     */
    private void aguardar(long millisegundos) {
        try {
            Thread.sleep(millisegundos);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
