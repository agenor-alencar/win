package com.win.marketplace.service;

import com.win.marketplace.dto.request.ItemPedidoRequestDTO;
import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.dto.mapper.PedidoMapper;
import com.win.marketplace.model.*;
import com.win.marketplace.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MotoristaRepository motoristaRepository;
    private final ProdutoRepository produtoRepository;
    private final PedidoMapper pedidoMapper;
    private final ObjectMapper objectMapper;

    private final PedidoStatusService pedidoStatusService;

    @SuppressWarnings("null")
    public PedidoResponseDTO criarPedido(PedidoCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setNumeroPedido(gerarNumeroPedido());
        pedido.setStatus(Pedido.StatusPedido.PENDENTE);
        
        // Mapear endereço de entrega
        try {
            Pedido.Endereco endereco = objectMapper.convertValue(requestDTO.enderecoEntrega(), Pedido.Endereco.class);
            pedido.setEnderecoEntrega(endereco);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao mapear endereço de entrega: " + e.getMessage());
        }
        
        // Mapear pagamento se presente
        if (requestDTO.pagamento() != null) {
            try {
                Pedido.Pagamento pagamento = objectMapper.convertValue(requestDTO.pagamento(), Pedido.Pagamento.class);
                pedido.setPagamento(pagamento);
            } catch (Exception e) {
                throw new RuntimeException("Erro ao mapear pagamento: " + e.getMessage());
            }
        }
        
        // Inicializar valores
        pedido.setDesconto(requestDTO.desconto() != null ? requestDTO.desconto() : BigDecimal.ZERO);
        pedido.setFrete(requestDTO.frete() != null ? requestDTO.frete() : BigDecimal.ZERO);
        
        // Mapear itens e determinar lojista
        List<ItemPedido> itens = new ArrayList<>();
        Lojista lojistaDoPedido = null;
        
        for (ItemPedidoRequestDTO itemDTO : requestDTO.itens()) {
            Produto produto = produtoRepository.findById(itemDTO.produtoId())
                    .orElseThrow(() -> new RuntimeException("Produto não encontrado: " + itemDTO.produtoId()));
            
            // ✅ FIX: Definir lojista do pedido baseado no primeiro produto
            if (lojistaDoPedido == null) {
                lojistaDoPedido = produto.getLojista();
                if (lojistaDoPedido == null) {
                    throw new RuntimeException("Produto sem lojista associado: " + produto.getNome());
                }
            } else {
                // Validar que todos os produtos são do mesmo lojista
                if (!lojistaDoPedido.getId().equals(produto.getLojista().getId())) {
                    throw new RuntimeException("Todos os produtos devem ser do mesmo lojista. " +
                            "Produto '" + produto.getNome() + "' pertence a outro lojista.");
                }
            }
            
            ItemPedido item = new ItemPedido();
            item.setPedido(pedido);
            item.setProduto(produto);
            item.setLojista(produto.getLojista());
            item.setNomeProduto(produto.getNome());
            item.setQuantidade(itemDTO.quantidade());
            item.setPrecoUnitario(itemDTO.precoUnitario());
            
            // Calcular subtotal e preco total do item
            BigDecimal subtotal = itemDTO.precoUnitario().multiply(BigDecimal.valueOf(itemDTO.quantidade()));
            item.setSubtotal(subtotal);
            item.setPrecoTotal(subtotal);
            
            itens.add(item);
        }
        
        // ✅ FIX: Definir o lojista do pedido (OBRIGATÓRIO)
        pedido.setLojista(lojistaDoPedido);
        pedido.setItens(itens);
        
        // Calcular totais
        calcularTotais(pedido);

        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorUsuario(UUID usuarioId) {
        // Usa query com join fetch para evitar LazyInitializationException
        List<Pedido> pedidos = pedidoRepository.findByUsuarioIdWithDetails(usuarioId);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorMotorista(UUID motoristaId) {
        List<Pedido> pedidos = pedidoRepository.findByMotoristaId(motoristaId);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPorStatus(Pedido.StatusPedido status) {
        List<Pedido> pedidos = pedidoRepository.findByStatus(status);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorLojista(UUID lojistaId) {
        List<Pedido> pedidos = pedidoRepository.findByLojistaId(lojistaId);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPagosPendentesPreparacaoPorLojista(UUID lojistaId) {
        List<Pedido.StatusPedido> statusesPendentesPreparacao = Arrays.asList(
                Pedido.StatusPedido.PENDENTE,
                Pedido.StatusPedido.CONFIRMADO,
                Pedido.StatusPedido.PREPARANDO,
                Pedido.StatusPedido.PRONTO,
                Pedido.StatusPedido.EM_TRANSITO
        );

        List<Pedido> pedidos = pedidoRepository.findByLojistaIdAndStatusPagamentoAndStatusIn(
                lojistaId,
                Pedido.StatusPagamento.APROVADO,
                statusesPendentesPreparacao
        );

        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorLojistaEStatus(UUID lojistaId, Pedido.StatusPedido status) {
        List<Pedido> pedidos = pedidoRepository.findByLojistaIdAndStatus(lojistaId, status);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public PedidoResponseDTO buscarPorId(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return pedidoMapper.toResponseDTO(pedido);
    }

    @Transactional(readOnly = true)
    public PedidoResponseDTO buscarPorNumeroPedido(String numeroPedido) {
        Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        return pedidoMapper.toResponseDTO(pedido);
    }

    public PedidoResponseDTO atualizarStatus(UUID id, Pedido.StatusPedido novoStatus) {
        Pedido savedPedido = pedidoStatusService.transicionarStatus(id, novoStatus);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO confirmarPedido(UUID id) {
        Pedido savedPedido = pedidoStatusService.transicionarStatus(id, Pedido.StatusPedido.CONFIRMADO);
        
        // 🚚 INTEGRAÇÃO UBER DIRECT: Solicitar entrega automaticamente
        // NOTA: Entrega só é solicitada quando lojista marcar como "Pronto para Retirada"
        // por isso apenas logamos aqui
        try {
            log.info("✅ Pedido confirmado: {}. Entrega Uber será solicitada quando estiver pronto para retirada.", 
                    savedPedido.getNumeroPedido());
            
            // TODO: Lojista deve chamar entregaService.solicitarCorridaUber() quando produto estiver pronto
            // Para integração automática imediata, descomente:
            // entregaService.solicitarCorridaUber(savedPedido.getId());
        } catch (Exception e) {
            log.error("❌ Erro ao processar confirmação do pedido {}: {}", 
                    savedPedido.getNumeroPedido(), e.getMessage(), e);
        }
        
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO cancelarPedido(UUID id, String motivo) {
        Pedido savedPedido = pedidoStatusService.transicionarStatus(id, Pedido.StatusPedido.CANCELADO);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO atribuirMotorista(UUID pedidoId, UUID motoristaId) {
        @SuppressWarnings("null")
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        Motorista motorista = motoristaRepository.findById(motoristaId)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));
        
        pedido.setMotorista(motorista);
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO marcarComoPreparando(UUID id) {
        return atualizarStatus(id, Pedido.StatusPedido.PREPARANDO);
    }

    public PedidoResponseDTO marcarComoPronto(UUID id) {
        return atualizarStatus(id, Pedido.StatusPedido.PRONTO);
    }

    public PedidoResponseDTO marcarComoEmTransito(UUID id) {
        return atualizarStatus(id, Pedido.StatusPedido.EM_TRANSITO);
    }

    public PedidoResponseDTO marcarComoEntregue(UUID id, String codigoEntrega) {
        @SuppressWarnings("null")
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (pedido.getStatus() != Pedido.StatusPedido.EM_TRANSITO) {
            throw new RuntimeException("Pedido deve estar em trânsito para ser marcado como entregue");
        }
        
        if (pedido.getCodigoEntrega() == null) {
            throw new RuntimeException("Pedido não possui código de entrega");
        }
        
        if (!pedido.getCodigoEntrega().equals(codigoEntrega)) {
            throw new RuntimeException("Código de entrega inválido");
        }
        
        Pedido savedPedido = pedidoStatusService.transicionarStatus(id, Pedido.StatusPedido.ENTREGUE);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    /**
     * Conta o número de pedidos do usuário (para verificar primeira compra)
     */
    @Transactional(readOnly = true)
    public long contarPedidosPorUsuario(UUID usuarioId) {
        return pedidoRepository.countByUsuarioId(usuarioId);
    }

    private String gerarNumeroPedido() {
        // Gera um número de pedido único baseado no timestamp
        return "PED" + System.currentTimeMillis();
    }

    private void calcularTotais(Pedido pedido) {
        BigDecimal subtotal = BigDecimal.ZERO;
        
        // Se o pedido tem itens, calcular o subtotal
        if (pedido.getItens() != null && !pedido.getItens().isEmpty()) {
            subtotal = pedido.getItens().stream()
                    .map(item -> item.getPrecoUnitario().multiply(BigDecimal.valueOf(item.getQuantidade())))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }
        
        pedido.setSubtotal(subtotal);
        
        // Garantir que desconto e frete não sejam nulos
        BigDecimal desconto = pedido.getDesconto() != null ? pedido.getDesconto() : BigDecimal.ZERO;
        BigDecimal frete = pedido.getFrete() != null ? pedido.getFrete() : BigDecimal.ZERO;
        
        // Calcular total: subtotal + frete - desconto
        BigDecimal total = subtotal.add(frete).subtract(desconto);
        
        // Garantir que o total não seja negativo
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }
        
        pedido.setTotal(total);
    }
}
