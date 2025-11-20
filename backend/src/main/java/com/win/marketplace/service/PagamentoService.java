package com.win.marketplace.service;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.common.IdentificationRequest;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.client.preference.PreferencePaymentMethodsRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.dto.mapper.PagamentoMapper;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.repository.PagamentoRepository;
import com.win.marketplace.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;
    private final PagamentoMapper pagamentoMapper;

    @Value("${mercadopago.access-token:}")
    private String mercadoPagoAccessToken;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public PagamentoResponseDTO processarPagamento(PagamentoRequestDTO requestDTO) {
        Pedido pedido = pedidoRepository.findById(requestDTO.pedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        Pagamento pagamento = pagamentoMapper.toEntity(requestDTO);
        pagamento.setPedido(pedido);
        pagamento.setStatus(Pagamento.StatusPagamento.PROCESSANDO);

        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    @Transactional(readOnly = true)
    public PagamentoResponseDTO buscarPorPedidoId(UUID pedidoId) {
        Pagamento pagamento = pagamentoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado para o pedido"));
        return pagamentoMapper.toResponseDTO(pagamento);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponseDTO> listarPorStatus(Pagamento.StatusPagamento status) {
        List<Pagamento> pagamentos = pagamentoRepository.findByStatus(status);
        return pagamentoMapper.toResponseDTOList(pagamentos);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponseDTO> listarPorMetodo(String metodoPagamento) {
        List<Pagamento> pagamentos = pagamentoRepository.findByMetodoPagamento(metodoPagamento);
        return pagamentoMapper.toResponseDTOList(pagamentos);
    }

    @Transactional(readOnly = true)
    public PagamentoResponseDTO buscarPorTransacaoId(String transacaoId) {
        Pagamento pagamento = pagamentoRepository.findByTransacaoId(transacaoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado para a transação"));
        return pagamentoMapper.toResponseDTO(pagamento);
    }

    public PagamentoResponseDTO aprovarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.APROVADO);
        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO recusarPagamento(UUID pagamentoId, String motivo) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.RECUSADO);
        if (motivo != null) {
            pagamento.setObservacoes(motivo);
        }
        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO cancelarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.CANCELADO);
        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO estornarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        if (pagamento.getStatus() != Pagamento.StatusPagamento.APROVADO) {
            throw new RuntimeException("Apenas pagamentos aprovados podem ser estornados");
        }

        pagamento.setStatus(Pagamento.StatusPagamento.ESTORNADO);
        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponseDTO> listarTodos() {
        List<Pagamento> pagamentos = pagamentoRepository.findAll();
        return pagamentoMapper.toResponseDTOList(pagamentos);
    }

    // ========================================================================
    // INTEGRAÇÃO MERCADO PAGO
    // ========================================================================

    /**
     * Cria uma preferência de pagamento no Mercado Pago
     * 
     * @param pedidoId ID do pedido
     * @param titulo Título do produto/pedido
     * @param quantidade Quantidade
     * @param valorUnitario Valor unitário
     * @return URL para checkout do Mercado Pago
     * @throws MPException Erro na comunicação com Mercado Pago
     * @throws MPApiException Erro na API do Mercado Pago
     */
    public String criarPreferenciaMercadoPago(
            UUID pedidoId,
            String titulo,
            Integer quantidade,
            BigDecimal valorUnitario
    ) throws MPException, MPApiException {
        
        validarConfigMercadoPago();

        // Criar item
        PreferenceItemRequest item = PreferenceItemRequest.builder()
                .title(titulo)
                .quantity(quantidade)
                .unitPrice(valorUnitario)
                .currencyId("BRL")
                .build();

        List<PreferenceItemRequest> items = new ArrayList<>();
        items.add(item);

        // URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/pagamento/sucesso?pedidoId=" + pedidoId)
                .failure(frontendUrl + "/pagamento/falha?pedidoId=" + pedidoId)
                .pending(frontendUrl + "/pagamento/pendente?pedidoId=" + pedidoId)
                .build();

        // Criar preferência
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .autoReturn("approved")
                .externalReference(pedidoId.toString())
                .statementDescriptor("WIN Marketplace")
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        // Retornar URL de checkout
        return preference.getInitPoint();
    }

    /**
     * Cria preferência de pagamento para um pedido completo
     * 
     * @param pedidoId ID do pedido
     * @return URL para checkout do Mercado Pago
     * @throws MPException Erro na comunicação com Mercado Pago
     * @throws MPApiException Erro na API do Mercado Pago
     */
    public String criarPreferenciaPedido(UUID pedidoId) throws MPException, MPApiException {
        validarConfigMercadoPago();

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Converter itens do pedido
        List<PreferenceItemRequest> itemsRequest = new ArrayList<>();
        pedido.getItens().forEach(item -> {
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .title(item.getProduto().getNome())
                    .quantity(item.getQuantidade())
                    .unitPrice(item.getPrecoUnitario())
                    .currencyId("BRL")
                    .build();
            itemsRequest.add(itemRequest);
        });

        // URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/pagamento/sucesso?pedidoId=" + pedidoId)
                .failure(frontendUrl + "/pagamento/falha?pedidoId=" + pedidoId)
                .pending(frontendUrl + "/pagamento/pendente?pedidoId=" + pedidoId)
                .build();

        // Criar preferência
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(itemsRequest)
                .backUrls(backUrls)
                .autoReturn("approved")
                .externalReference(pedidoId.toString())
                .statementDescriptor("WIN Marketplace")
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        return preference.getInitPoint();
    }

    /**
     * Valida se o Mercado Pago está configurado
     */
    private void validarConfigMercadoPago() {
        if (mercadoPagoAccessToken == null || mercadoPagoAccessToken.isBlank()) {
            throw new IllegalStateException(
                "Mercado Pago não configurado. " +
                "Configure MERCADOPAGO_ACCESS_TOKEN no .env"
            );
        }
        // Configurar SDK do Mercado Pago
        MercadoPagoConfig.setAccessToken(mercadoPagoAccessToken);
    }

    /**
     * Cria preferência de pagamento PIX via Mercado Pago (Checkout Pro)
     * @param pedidoId ID do pedido
     * @param cpf CPF do pagador
     * @param email Email do pagador
     * @return Map com URL de checkout e informações da preferência
     */
    public Map<String, Object> criarPagamentoPix(
            UUID pedidoId,
            String cpf,
            String email
    ) throws MPException, MPApiException {
        log.info("=== INICIANDO CRIAÇÃO DE PREFERÊNCIA PIX ===");
        log.info("Pedido ID: {}", pedidoId);
        log.info("CPF: {}", cpf);
        log.info("Email: {}", email);
        
        validarConfigMercadoPago();
        log.info("Configuração Mercado Pago validada com sucesso");

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        log.info("Pedido encontrado - Número: {}, Total: {}", pedido.getNumeroPedido(), pedido.getTotal());

        // Criar itens da preferência a partir dos itens do pedido
        List<PreferenceItemRequest> items = new ArrayList<>();
        
        pedido.getItens().forEach(itemPedido -> {
            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .id(itemPedido.getProduto().getId().toString())
                    .title(itemPedido.getProduto().getNome())
                    .description(itemPedido.getProduto().getDescricao())
                    .categoryId("marketplace")
                    .quantity(itemPedido.getQuantidade())
                    .currencyId("BRL")
                    .unitPrice(itemPedido.getPrecoUnitario())
                    .build();
            items.add(item);
        });

        // Configurar URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/payment/success?pedidoId=" + pedidoId)
                .failure(frontendUrl + "/payment/failure?pedidoId=" + pedidoId)
                .pending(frontendUrl + "/payment/pending?pedidoId=" + pedidoId)
                .build();

        // Configurar métodos de pagamento (apenas PIX)
        PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                .excludedPaymentTypes(Arrays.asList())
                .excludedPaymentMethods(Arrays.asList())
                .installments(1)
                .defaultInstallments(1)
                .build();

        // Criar preferência
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(items)
                .backUrls(backUrls)
                .paymentMethods(paymentMethods)
                .externalReference(pedidoId.toString())
                .statementDescriptor("WIN Marketplace")
                .autoReturn("approved")
                .build();

        log.info("PreferenceRequest construído - {} itens, Total: {}", items.size(), pedido.getTotal());

        // Criar preferência no Mercado Pago
        Preference preference = null;
        try {
            log.info("Chamando Mercado Pago API para criar preferência...");
            PreferenceClient client = new PreferenceClient();
            preference = client.create(preferenceRequest);
            log.info("✅ PREFERÊNCIA CRIADA COM SUCESSO - ID: {}", preference.getId());
        } catch (MPApiException e) {
            log.error("❌ ERRO DA API MERCADO PAGO:");
            log.error("Status Code: {}", e.getStatusCode());
            log.error("Message: {}", e.getMessage());
            log.error("API Response: {}", e.getApiResponse());
            throw new RuntimeException("Erro ao criar preferência: " + e.getMessage() + " (Status: " + e.getStatusCode() + ")", e);
        } catch (MPException e) {
            log.error("❌ ERRO NO SDK MERCADO PAGO: {}", e.getMessage(), e);
            throw new RuntimeException("Erro no SDK Mercado Pago: " + e.getMessage(), e);
        }

        log.info("Preferência criada - ID: {}", preference.getId());
        log.info("Init Point: {}", preference.getInitPoint());

        // Retornar informações da preferência
        Map<String, Object> pixInfo = new HashMap<>();
        pixInfo.put("preferenceId", preference.getId());
        pixInfo.put("initPoint", preference.getInitPoint());
        pixInfo.put("sandboxInitPoint", preference.getSandboxInitPoint());
        
        // Atualizar pagamento no banco
        Pagamento pagamento = new Pagamento();
        pagamento.setPedido(pedido);
        pagamento.setMetodoPagamento("PIX");
        pagamento.setValor(pedido.getTotal());
        pagamento.setStatus(Pagamento.StatusPagamento.PENDENTE);
        pagamento.setTransacaoId(preference.getId());
        pagamentoRepository.save(pagamento);

        return pixInfo;
    }

    /**
     * Cria preferência de pagamento para cartão de crédito via Mercado Pago
     * @param pedidoId ID do pedido
     * @return URL para checkout do Mercado Pago
     */
    public String criarPreferenciaCartao(UUID pedidoId) throws MPException, MPApiException {
        validarConfigMercadoPago();

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Converter itens do pedido
        List<PreferenceItemRequest> itemsRequest = new ArrayList<>();
        pedido.getItens().forEach(item -> {
            PreferenceItemRequest itemRequest = PreferenceItemRequest.builder()
                    .title(item.getProduto().getNome())
                    .description(item.getProduto().getDescricao())
                    .quantity(item.getQuantidade())
                    .unitPrice(item.getPrecoUnitario())
                    .currencyId("BRL")
                    .build();
            itemsRequest.add(itemRequest);
        });

        // Configurar métodos de pagamento (aceitar todos)
        PreferencePaymentMethodsRequest paymentMethods = PreferencePaymentMethodsRequest.builder()
                .installments(12)  // Até 12 parcelas
                .build();

        // URLs de retorno
        PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                .success(frontendUrl + "/pagamento/sucesso?pedidoId=" + pedidoId)
                .failure(frontendUrl + "/pagamento/falha?pedidoId=" + pedidoId)
                .pending(frontendUrl + "/pagamento/pendente?pedidoId=" + pedidoId)
                .build();

        // Criar preferência
        PreferenceRequest preferenceRequest = PreferenceRequest.builder()
                .items(itemsRequest)
                .paymentMethods(paymentMethods)
                .backUrls(backUrls)
                .autoReturn("approved")
                .externalReference(pedidoId.toString())
                .statementDescriptor("WIN Marketplace")
                .build();

        PreferenceClient client = new PreferenceClient();
        Preference preference = client.create(preferenceRequest);

        log.info("Preferência de cartão criada - ID: {}, URL: {}", preference.getId(), preference.getInitPoint());

        // Atualizar pagamento no banco
        Pagamento pagamento = new Pagamento();
        pagamento.setPedido(pedido);
        pagamento.setMetodoPagamento("CREDIT_CARD");
        pagamento.setValor(pedido.getTotal());
        pagamento.setStatus(Pagamento.StatusPagamento.PROCESSANDO);
        pagamento.setTransacaoId(preference.getId());
        pagamentoRepository.save(pagamento);

        return preference.getInitPoint();
    }

    /**
     * Atualiza status do pagamento via webhook do Mercado Pago
     */
    public void processarWebhookMercadoPago(Map<String, Object> payload) {
        try {
            String type = (String) payload.get("type");
            
            if ("payment".equals(type)) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                Long paymentId = ((Number) data.get("id")).longValue();
                
                log.info("Webhook recebido - Pagamento ID: {}", paymentId);
                
                // Buscar detalhes do pagamento no Mercado Pago
                validarConfigMercadoPago();
                PaymentClient paymentClient = new PaymentClient();
                Payment payment = paymentClient.get(paymentId);
                
                // Atualizar status no banco
                pagamentoRepository.findByTransacaoId(payment.getId().toString())
                    .ifPresent(pagamento -> {
                        switch (payment.getStatus()) {
                            case "approved":
                                pagamento.setStatus(Pagamento.StatusPagamento.APROVADO);
                                break;
                            case "rejected":
                                pagamento.setStatus(Pagamento.StatusPagamento.RECUSADO);
                                break;
                            case "cancelled":
                                pagamento.setStatus(Pagamento.StatusPagamento.CANCELADO);
                                break;
                            case "refunded":
                                pagamento.setStatus(Pagamento.StatusPagamento.ESTORNADO);
                                break;
                            default:
                                pagamento.setStatus(Pagamento.StatusPagamento.PROCESSANDO);
                        }
                        pagamentoRepository.save(pagamento);
                        log.info("Status do pagamento atualizado - ID: {}, Status: {}", 
                            pagamento.getId(), pagamento.getStatus());
                    });
            }
        } catch (Exception e) {
            log.error("Erro ao processar webhook do Mercado Pago", e);
            throw new RuntimeException("Erro ao processar webhook: " + e.getMessage());
        }
    }
}
