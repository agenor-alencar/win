package com.win.marketplace.service;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.dto.mapper.PagamentoMapper;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Configuracao;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.ItemPedido;
import com.win.marketplace.repository.PagamentoRepository;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.ConfiguracaoRepository;
import com.win.marketplace.repository.LojistaRepository;
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
    private final ConfiguracaoRepository configuracaoRepository;
    private final PagamentoMapper pagamentoMapper;
    private final PagarMeService pagarMeService;
    private final PedidoStatusService pedidoStatusService;

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
        
        // Atualizar status do pedido associado
        if (pagamento.getPedido() != null) {
            Pedido pedido = pagamento.getPedido();
            pedido.setStatusPagamento(Pedido.StatusPagamento.APROVADO);
            pedidoRepository.save(pedido);
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.CONFIRMADO);
            log.info("✅ Pedido confirmado manualmente - Número: {}", pedido.getNumeroPedido());
        }
        
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
        
        // Atualizar status do pedido associado
        if (pagamento.getPedido() != null) {
            Pedido pedido = pagamento.getPedido();
            pedido.setStatusPagamento(Pedido.StatusPagamento.RECUSADO);
            // Pedido permanece PENDENTE para permitir nova tentativa de pagamento
            pedidoRepository.save(pedido);
            log.info("⚠️ Pagamento recusado - Pedido: {}, Motivo: {}", 
                pedido.getNumeroPedido(), motivo);
        }
        
        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO cancelarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.CANCELADO);
        Pagamento savedPagamento = pagamentoRepository.save(pagamento);
        
        // Atualizar status do pedido associado
        if (pagamento.getPedido() != null) {
            Pedido pedido = pagamento.getPedido();
            pedido.setStatusPagamento(Pedido.StatusPagamento.CANCELADO);
            pedidoRepository.save(pedido);
            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.CANCELADO);
            log.info("❌ Pedido cancelado - Número: {}", pedido.getNumeroPedido());
        }
        
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
    // INTEGRAÇÃO PAGAR.ME (STONE)
    // ========================================================================

    /**
     * Cria cobrança PIX via Pagar.me
     * 
     * @param pedidoId ID do pedido
     * @param clienteNome Nome do cliente
     * @param clienteEmail Email do cliente
     * @param clienteCpf CPF do cliente
     * @return Map com QR Code e informações da cobrança
     */
    public Map<String, Object> criarPagamentoPixPagarMe(
            UUID pedidoId,
            String clienteNome,
            String clienteEmail,
            String clienteCpf,
            String clienteTelefone
    ) {
        log.info("=== INICIANDO CRIAÇÃO DE COBRANÇA PIX PAGAR.ME ===");
        log.info("Pedido ID: {}", pedidoId);
        log.info("Cliente: {}, Email: {}", clienteNome, clienteEmail);
        
        if (!pagarMeService.isEnabled()) {
            throw new IllegalStateException(
                "Pagar.me não está habilitado. Configure PAGARME_ENABLED=true no .env"
            );
        }

        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        log.info("Pedido encontrado - Número: {}, Total: R$ {}", 
            pedido.getNumeroPedido(), pedido.getTotal());

        // Se telefone não foi fornecido, buscar do usuário
        if (clienteTelefone == null || clienteTelefone.isBlank()) {
            if (pedido.getUsuario() != null && pedido.getUsuario().getTelefone() != null) {
                clienteTelefone = pedido.getUsuario().getTelefone();
                log.info("📞 Telefone obtido do usuário: {}", clienteTelefone);
            } else {
                log.warn("⚠️ Telefone não fornecido e usuário não tem telefone cadastrado!");
            }
        }

        // Converter valor para centavos
        Integer valorCentavos = pedido.getTotal().multiply(new java.math.BigDecimal("100")).intValue();
        
        // Descrição do pedido
        StringBuilder descricao = new StringBuilder("Pedido #" + pedido.getNumeroPedido());
        if (!pedido.getItens().isEmpty()) {
            descricao.append(" - ");
            descricao.append(pedido.getItens().size()).append(" item(ns)");
        }

        // Buscar configurações do sistema para split de pagamento
        Configuracao config = configuracaoRepository.findConfigAtiva()
            .orElseGet(() -> {
                log.warn("⚠️ Configuração ativa não encontrada. Usando valores padrão.");
                return new Configuracao(); // Usa valores padrão da entidade
            });
        
        String recipientIdMarketplace = config.getPagarmeRecipientIdMarketplace();
        String recipientIdLojista = null;
        BigDecimal percentualComissao = config.getTaxaComissaoWin();
        
        log.info("📊 Configuração do sistema:");
        log.info("   └─ Taxa de comissão WIN: {}%", percentualComissao);
        log.info("   └─ Taxa de repasse lojista: {}%", config.getTaxaRepasseLojista());
        log.info("   └─ Marketplace recipient ID: {}", 
            recipientIdMarketplace != null ? recipientIdMarketplace : "NÃO CONFIGURADO");
        
        if (recipientIdMarketplace == null) {
            log.warn("⚠️ Recipient ID do marketplace não configurado. Split será desabilitado.");
        }
        
        // Buscar lojista do primeiro item do pedido (assumindo pedidos de um único lojista)
        if (!pedido.getItens().isEmpty()) {
            ItemPedido primeiroItem = pedido.getItens().get(0);
            if (primeiroItem.getProduto() != null && primeiroItem.getProduto().getLojista() != null) {
                Lojista lojista = primeiroItem.getProduto().getLojista();
                recipientIdLojista = lojista.getPagarmeRecipientId();
                log.info("🏪 Lojista: {} - Recipient ID: {}", 
                    lojista.getNomeFantasia(), 
                    recipientIdLojista != null ? recipientIdLojista : "NÃO CONFIGURADO");
            }
        }
        
        // Calcular valor do frete
        BigDecimal valorFrete = pedido.getValorFrete() != null ? pedido.getValorFrete() : BigDecimal.ZERO;
        Integer valorFreteCentavos = valorFrete.multiply(new BigDecimal("100")).intValue();

        // Criar cobrança no Pagar.me com split
        Map<String, Object> cobranca = pagarMeService.criarCobrancaPix(
            pedidoId.toString(),
            valorCentavos,
            clienteNome,
            clienteEmail,
            clienteCpf,
            clienteTelefone,
            descricao.toString(),
            recipientIdMarketplace,
            recipientIdLojista,
            valorFreteCentavos,
            percentualComissao
        );

        log.info("✅ Cobrança PIX Pagar.me criada - ID: {}", cobranca.get("id"));

        // Salvar pagamento no banco
        Pagamento pagamento = new Pagamento();
        pagamento.setPedido(pedido);
        pagamento.setMetodoPagamento("PIX_PAGARME");
        pagamento.setValor(pedido.getTotal());
        pagamento.setStatus(Pagamento.StatusPagamento.PENDENTE);
        pagamento.setTransacaoId((String) cobranca.get("id"));
        pagamentoRepository.save(pagamento);

        log.info("Pagamento registrado no banco - ID: {}", pagamento.getId());

        // Retornar informações da cobrança
        log.info("🔍 Montando resposta com dados da cobrança...");
        log.info("🔍 Dados recebidos do Pagar.me: {}", cobranca);
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("orderId", cobranca.get("id"));
        resultado.put("qrCode", cobranca.get("qr_code"));
        resultado.put("qrCodeUrl", cobranca.get("qr_code_url"));
        resultado.put("status", cobranca.get("status"));
        resultado.put("amount", cobranca.get("amount"));
        resultado.put("expiresAt", cobranca.get("expires_at"));
        resultado.put("transactionId", cobranca.get("transaction_id"));

        log.info("✅ Resposta montada com sucesso: qrCode={}, qrCodeUrl={}", 
            resultado.get("qrCode") != null ? "presente" : "ausente",
            resultado.get("qrCodeUrl") != null ? "presente" : "ausente"
        );
        
        return resultado;
    }

    /**
     * Busca ordem no Pagar.me pelo ID
     * 
     * @param orderId ID da ordem
     * @return Dados da ordem
     */
    public Map<String, Object> buscarOrdemPagarMe(String orderId) {
        return pagarMeService.buscarOrdem(orderId);
    }

    /**
     * Cancela ordem no Pagar.me
     * 
     * @param orderId ID da ordem
     * @return Dados da ordem cancelada
     */
    public Map<String, Object> cancelarOrdemPagarMe(String orderId) {
        Map<String, Object> ordem = pagarMeService.cancelarOrdem(orderId);
        
        // Atualizar status no banco
        pagamentoRepository.findByTransacaoId(orderId)
            .ifPresent(pagamento -> {
                pagamento.setStatus(Pagamento.StatusPagamento.CANCELADO);
                pagamentoRepository.save(pagamento);
                log.info("✅ Status do pagamento atualizado para CANCELADO - ID: {}", 
                    pagamento.getId());
            });
        
        return ordem;
    }

    /**
     * Busca dados do pagamento PIX para exibição na página de pagamento
     * 
     * @param pedidoId ID do pedido
     * @return Map com billing (dados PIX) e pedido (dados do pedido)
     */
    public Map<String, Object> buscarDadosPagamentoPix(UUID pedidoId) {
        // Buscar pedido
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        // Buscar pagamento mais recente do pedido
        Pagamento pagamento = pagamentoRepository.findTopByPedidoOrderByCriadoEmDesc(pedido)
            .orElseThrow(() -> new RuntimeException("Pagamento não encontrado para este pedido"));
        
        // Se tiver transactionId, buscar dados atualizados no Pagar.me
        Map<String, Object> billing = new HashMap<>();
        if (pagamento.getTransacaoId() != null && !pagamento.getTransacaoId().isEmpty()) {
            try {
                Map<String, Object> ordem = pagarMeService.buscarOrdem(pagamento.getTransacaoId());
                
                // Extrair dados do PIX da resposta do Pagar.me
                // A resposta tem charges como array direto, não charges.data
                Object chargesObj = ordem.get("charges");
                if (chargesObj instanceof List) {
                    List<Map<String, Object>> chargeList = (List<Map<String, Object>>) chargesObj;
                    if (!chargeList.isEmpty()) {
                        Map<String, Object> charge = chargeList.get(0);
                        Map<String, Object> lastTransaction = (Map<String, Object>) charge.get("last_transaction");
                        
                        if (lastTransaction != null) {
                            billing.put("qrCode", lastTransaction.get("qr_code"));
                            billing.put("qrCodeUrl", lastTransaction.get("qr_code_url"));
                            billing.put("billingId", pagamento.getTransacaoId());
                            billing.put("amount", pagamento.getValor().multiply(new java.math.BigDecimal(100)).intValue());
                            billing.put("status", pagamento.getStatus().toString().toLowerCase());
                            
                            log.info("📋 Dados PIX carregados - qrCode: {}, qrCodeUrl: {}", 
                                lastTransaction.get("qr_code") != null ? "presente" : "ausente",
                                lastTransaction.get("qr_code_url") != null ? "presente" : "ausente");
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("Erro ao buscar dados atualizados no Pagar.me: {}", e.getMessage());
                // Continuar com dados do banco
            }
        }
        
        // Se não conseguiu buscar do Pagar.me, usar dados do banco
        if (billing.isEmpty()) {
            billing.put("billingId", pagamento.getTransacaoId());
            billing.put("amount", pagamento.getValor().multiply(new java.math.BigDecimal(100)).intValue());
            billing.put("status", pagamento.getStatus().toString().toLowerCase());
        }
        
        // Dados do pedido
        Map<String, Object> pedidoData = new HashMap<>();
        pedidoData.put("id", pedido.getId().toString());
        pedidoData.put("total", pedido.getValorTotal().doubleValue());
        pedidoData.put("status", pedido.getStatusPagamento().toString());
        
        Map<String, Object> response = new HashMap<>();
        response.put("billing", billing);
        response.put("pedido", pedidoData);
        
        return response;
    }

    /**
     * Verifica status do pagamento PIX no Pagar.me
     * 
     * @param orderId ID da ordem no Pagar.me
     * @return Status do pagamento (pending, paid, canceled, etc)
     */
    public String verificarStatusPagamentoPix(String orderId) {
        try {
            Map<String, Object> ordem = pagarMeService.buscarOrdem(orderId);
            String status = (String) ordem.get("status");
            
            // Atualizar status no banco se necessário
            pagamentoRepository.findByTransacaoId(orderId)
                .ifPresent(pagamento -> {
                    String statusInterno = pagarMeService.traduzirStatus(status);
                    try {
                        Pagamento.StatusPagamento statusEnum = Pagamento.StatusPagamento.valueOf(statusInterno);
                        if (pagamento.getStatus() != statusEnum) {
                            pagamento.setStatus(statusEnum);
                            pagamentoRepository.save(pagamento);
                            log.info("✅ Status do pagamento atualizado via polling - ID: {}, Status: {}", 
                                pagamento.getId(), statusEnum);
                            
                            // Se aprovado, atualizar pedido
                            if ("APROVADO".equals(statusInterno)) {
                                Pedido pedido = pagamento.getPedido();
                                if (pedido != null) {
                                    pedido.setStatusPagamento(Pedido.StatusPagamento.APROVADO);
                                    pedidoRepository.save(pedido);
                                    if (pedido.getStatus() == Pedido.StatusPedido.PENDENTE) {
                                        pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.CONFIRMADO);
                                    }
                                    log.info("✅ Status do pedido atualizado para APROVADO - Pedido: {}", 
                                        pedido.getNumeroPedido());
                                }
                            }
                        }
                    } catch (IllegalArgumentException e) {
                        log.warn("Status interno inválido: {}", statusInterno);
                    }
                });
            
            return status;
            
        } catch (Exception e) {
            log.error("Erro ao verificar status no Pagar.me: {}", e.getMessage());
            throw new RuntimeException("Erro ao verificar status do pagamento: " + e.getMessage());
        }
    }

    /**
     * Atualiza status do pagamento via webhook do Pagar.me
     * 
     * @param payload Dados do webhook
     */
    public void processarWebhookPagarMe(Map<String, Object> payload) {
        try {
            String event = (String) payload.get("type");
            log.info("💳 Webhook Pagar.me recebido - Evento: {}", event);

            // Eventos comuns: order.paid, order.payment_failed, order.canceled
            if (event != null && event.contains("order")) {
                Map<String, Object> data = (Map<String, Object>) payload.get("data");
                
                if (data != null) {
                    String orderId = (String) data.get("id");
                    String status = (String) data.get("status");
                    
                    log.info("Ordem atualizada - ID: {}, Status: {}", orderId, status);
                    
                    // Atualizar status no banco
                    pagamentoRepository.findByTransacaoId(orderId)
                        .ifPresent(pagamento -> {
                            String statusInterno = pagarMeService.traduzirStatus(status);
                            try {
                                pagamento.setStatus(Pagamento.StatusPagamento.valueOf(statusInterno));
                                pagamentoRepository.save(pagamento);
                                log.info("✅ Status do pagamento atualizado - ID: {}, Status: {}", 
                                    pagamento.getId(), pagamento.getStatus());
                                
                                // Se o pagamento foi aprovado, atualizar pedido completo
                                if ("APROVADO".equals(statusInterno)) {
                                    Pedido pedido = pagamento.getPedido();
                                    if (pedido != null) {
                                        // Atualizar status de pagamento
                                        pedido.setStatusPagamento(Pedido.StatusPagamento.APROVADO);
                                        pedidoRepository.save(pedido);
                                        if (pedido.getStatus() == Pedido.StatusPedido.PENDENTE) {
                                            pedidoStatusService.transicionarStatus(pedido.getId(), Pedido.StatusPedido.CONFIRMADO);
                                        }
                                        log.info("✅ Pedido confirmado - Número: {}, Status: {}, StatusPagamento: {}", 
                                            pedido.getNumeroPedido(), pedido.getStatus(), pedido.getStatusPagamento());
                                    }
                                }
                            } catch (IllegalArgumentException e) {
                                log.error("Status interno inválido: {}", statusInterno);
                            }
                        });
                }
            }
        } catch (Exception e) {
            log.error("❌ Erro ao processar webhook Pagar.me: {}", e.getMessage(), e);
            throw new RuntimeException("Erro ao processar webhook: " + e.getMessage());
        }
    }

    /**
     * Recria ou obtém pagamento PIX de um pedido existente
     * Valida produtos, preços e estoque antes de criar novo pagamento
     * 
     * @param pedidoId ID do pedido
     * @param dadosCliente Dados do cliente (nome, email, cpf, telefone)
     * @return Map com billing, pedido e avisos sobre alterações
     */
    public Map<String, Object> obterOuRecriarPagamentoPix(
        UUID pedidoId, 
        Map<String, String> dadosCliente
    ) {
        log.info("🔄 Obtendo ou recriando pagamento PIX para pedido {}", pedidoId);
        
        // 1. Buscar pedido
        Pedido pedido = pedidoRepository.findById(pedidoId)
            .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        // 2. Validar produtos do pedido
        Map<String, Object> validacao = validarProdutosPedido(pedido);
        boolean temAlteracoes = (boolean) validacao.getOrDefault("temAlteracoes", false);
        List<Map<String, Object>> avisos = (List<Map<String, Object>>) validacao.get("avisos");
        
        // 3. Se houver produtos indisponíveis, retornar erro
        List<Map<String, Object>> indisponiveis = avisos.stream()
            .filter(a -> "PRODUTO_INDISPONIVEL".equals(a.get("tipo")))
            .toList();
        
        if (!indisponiveis.isEmpty()) {
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("error", "PRODUTOS_INDISPONIVEIS");
            error.put("message", "Alguns produtos não estão mais disponíveis");
            error.put("produtosIndisponiveis", indisponiveis);
            return error;
        }
        
        // 4. Tentar buscar pagamento PIX existente e ainda válido
        Optional<Pagamento> pagamentoExistente = pagamentoRepository.findTopByPedidoOrderByCriadoEmDesc(pedido);
        
        if (pagamentoExistente.isPresent()) {
            Pagamento pag = pagamentoExistente.get();
            
            // Verificar se o pagamento PIX ainda é válido (menos de 25 minutos)
            if (pag.getTransacaoId() != null && 
                pag.getCriadoEm() != null &&
                java.time.Duration.between(pag.getCriadoEm(), java.time.LocalDateTime.now()).toMinutes() < 25) {
                
                log.info("✅ Pagamento PIX existente ainda válido");
                
                try {
                    Map<String, Object> dadosPix = buscarDadosPagamentoPix(pedidoId);
                    dadosPix.put("avisos", avisos);
                    dadosPix.put("temAlteracoes", temAlteracoes);
                    return dadosPix;
                } catch (Exception e) {
                    log.warn("⚠️ Erro ao buscar pagamento existente, criando novo: {}", e.getMessage());
                }
            } else {
                log.info("⏱️ Pagamento PIX expirado ou inválido, criando novo");
            }
        }
        
        // 5. Criar novo pagamento PIX
        log.info("🆕 Criando novo pagamento PIX");
        
        String nome = dadosCliente.getOrDefault("nome", pedido.getUsuario() != null ? pedido.getUsuario().getNome() : "Cliente");
        String email = dadosCliente.getOrDefault("email", pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : "");
        String cpf = dadosCliente.get("cpf");
        String telefone = dadosCliente.get("telefone");
        
        Map<String, Object> novoPix = criarPagamentoPixPagarMe(pedidoId, nome, email, cpf, telefone);
        
        // 6. Preparar resposta
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("billing", novoPix);
        response.put("pedido", Map.of(
            "id", pedido.getId().toString(),
            "total", pedido.getTotal().doubleValue(),
            "status", pedido.getStatusPagamento().toString()
        ));
        response.put("avisos", avisos);
        response.put("temAlteracoes", temAlteracoes);
        response.put("novoPagamento", true);
        
        log.info("✅ Novo pagamento PIX criado com sucesso");
        
        return response;
    }
    
    /**
     * Valida produtos do pedido verificando disponibilidade, preço e estoque
     */
    private Map<String, Object> validarProdutosPedido(Pedido pedido) {
        List<Map<String, Object>> avisos = new ArrayList<>();
        boolean temAlteracoes = false;
        
        for (ItemPedido item : pedido.getItens()) {
            if (item.getProduto() == null) {
                avisos.add(Map.of(
                    "tipo", "PRODUTO_INDISPONIVEL",
                    "mensagem", "Produto não encontrado no sistema",
                    "produtoNome", item.getNomeProduto() != null ? item.getNomeProduto() : "Desconhecido"
                ));
                temAlteracoes = true;
                continue;
            }
            
            var produto = item.getProduto();
            
            // Verificar se produto está ativo
            if (!produto.getAtivo()) {
                avisos.add(Map.of(
                    "tipo", "PRODUTO_INDISPONIVEL",
                    "mensagem", "Produto não está mais disponível",
                    "produtoNome", produto.getNome()
                ));
                temAlteracoes = true;
                continue;
            }
            
            // Verificar estoque
            if (produto.getEstoque() < item.getQuantidade()) {
                if (produto.getEstoque() == 0) {
                    avisos.add(Map.of(
                        "tipo", "PRODUTO_INDISPONIVEL",
                        "mensagem", "Produto sem estoque",
                        "produtoNome", produto.getNome()
                    ));
                } else {
                    avisos.add(Map.of(
                        "tipo", "ESTOQUE_ALTERADO",
                        "mensagem", String.format("Estoque reduzido para %d unidade(s)", produto.getEstoque()),
                        "produtoNome", produto.getNome(),
                        "estoqueDisponivel", produto.getEstoque(),
                        "quantidadePedido", item.getQuantidade()
                    ));
                }
                temAlteracoes = true;
            }
            
            // Verificar alteração de preço
            if (produto.getPreco().compareTo(item.getPrecoUnitario()) != 0) {
                avisos.add(Map.of(
                    "tipo", "PRECO_ALTERADO",
                    "mensagem", String.format("Preço atualizado de R$ %.2f para R$ %.2f", 
                        item.getPrecoUnitario().doubleValue(),
                        produto.getPreco().doubleValue()),
                    "produtoNome", produto.getNome(),
                    "precoAnterior", item.getPrecoUnitario().doubleValue(),
                    "precoAtual", produto.getPreco().doubleValue()
                ));
                temAlteracoes = true;
            }
        }
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("avisos", avisos);
        resultado.put("temAlteracoes", temAlteracoes);
        
        return resultado;
    }
}
