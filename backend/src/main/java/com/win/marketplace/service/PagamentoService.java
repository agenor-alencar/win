package com.win.marketplace.service;

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
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;
    private final PagamentoMapper pagamentoMapper;
    private final AbacatePayService abacatePayService;

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
    // INTEGRAÇÃO ABACATE PAY
    // ========================================================================

    /**
     * Cria cobrança PIX via Abacate Pay
     * 
     * @param pedidoId ID do pedido
     * @param email Email do cliente
     * @return Map com URL de pagamento e informações da cobrança
     */
    public Map<String, Object> criarPagamentoPix(
            UUID pedidoId,
            String cpf,
            String email
    ) {
        log.info("=== INICIANDO CRIAÇÃO DE COBRANÇA PIX ABACATE PAY ===");
        log.info("Pedido ID: {}", pedidoId);
        log.info("Email: {}", email);
        
        if (!abacatePayService.isConfigurado()) {
            throw new IllegalStateException(
                "Abacate Pay não configurado. Configure ABACATEPAY_API_KEY no .env"
            );
        }

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        log.info("Pedido encontrado - Número: {}, Total: R$ {}", 
            pedido.getNumeroPedido(), pedido.getTotal());

        // Converter valor para centavos
        Integer valorCentavos = abacatePayService.converterParaCentavos(pedido.getTotal());
        
        // Descrição dos itens do pedido
        StringBuilder descricao = new StringBuilder("Pedido #" + pedido.getNumeroPedido());
        if (!pedido.getItens().isEmpty()) {
            descricao.append(" - ");
            descricao.append(pedido.getItens().size()).append(" item(ns)");
        }

        // Criar cobrança no Abacate Pay
        Map<String, Object> cobranca = abacatePayService.criarCobrancaPix(
            pedidoId.toString(),
            valorCentavos,
            email,
            descricao.toString()
        );

        log.info("✅ Cobrança criada com sucesso - ID: {}", cobranca.get("id"));

        // Salvar pagamento no banco
        Pagamento pagamento = new Pagamento();
        pagamento.setPedido(pedido);
        pagamento.setMetodoPagamento("PIX");
        pagamento.setValor(pedido.getTotal());
        pagamento.setStatus(Pagamento.StatusPagamento.PENDENTE);
        pagamento.setTransacaoId((String) cobranca.get("id"));
        pagamentoRepository.save(pagamento);

        log.info("Pagamento registrado no banco - ID: {}", pagamento.getId());

        // Retornar informações da cobrança
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("billingId", cobranca.get("id"));
        resultado.put("checkoutUrl", cobranca.get("url"));
        resultado.put("status", cobranca.get("status"));
        resultado.put("amount", cobranca.get("amount"));

        return resultado;
    }

    /**
     * Busca cobrança no Abacate Pay pelo ID
     * 
     * @param billingId ID da cobrança
     * @return Dados da cobrança
     */
    public Map<String, Object> buscarCobrancaAbacatePay(String billingId) {
        return abacatePayService.buscarCobranca(billingId);
    }

    /**
     * Atualiza status do pagamento via webhook do Abacate Pay
     * 
     * @param payload Dados do webhook
     */
    public void processarWebhookAbacatePay(Map<String, Object> payload) {
        try {
            String event = (String) payload.get("event");
            log.info("🥑 Webhook Abacate Pay recebido - Evento: {}", event);

            if ("billing.paid".equals(event)) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                Map<String, Object> billing = (Map<String, Object>) data.get("billing");
                
                if (billing != null) {
                    String billingId = (String) billing.get("id");
                    String status = (String) billing.get("status");
                    
                    log.info("Cobrança paga - ID: {}, Status: {}", billingId, status);
                    
                    // Atualizar status no banco
                    pagamentoRepository.findByTransacaoId(billingId)
                        .ifPresent(pagamento -> {
                            String statusInterno = abacatePayService.traduzirStatus(status);
                            pagamento.setStatus(Pagamento.StatusPagamento.valueOf(statusInterno));
                            pagamentoRepository.save(pagamento);
                            log.info("✅ Status do pagamento atualizado - ID: {}, Status: {}", 
                                pagamento.getId(), pagamento.getStatus());
                        });
                }
            }
        } catch (Exception e) {
            log.error("❌ Erro ao processar webhook Abacate Pay: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar webhook: " + e.getMessage());
        }
    }
}
