package com.win.marketplace.service;

import com.win.marketplace.dto.request.PedidoCreateRequestDTO;
import com.win.marketplace.dto.response.PedidoResponseDTO;
import com.win.marketplace.dto.mapper.PedidoMapper;
import com.win.marketplace.model.*;
import com.win.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MotoristaRepository motoristaRepository;
    private final PedidoMapper pedidoMapper;

    public PedidoResponseDTO criarPedido(PedidoCreateRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = pedidoMapper.toEntity(requestDTO);
        pedido.setUsuario(usuario);
        pedido.setNumeroPedido(gerarNumeroPedido());
        pedido.setStatus(Pedido.StatusPedido.PENDENTE);
        
        // Inicializar valores padrão se não foram definidos
        if (pedido.getDesconto() == null) {
            pedido.setDesconto(BigDecimal.ZERO);
        }
        if (pedido.getFrete() == null) {
            pedido.setFrete(BigDecimal.ZERO);
        }
        
        // Calcular totais
        calcularTotais(pedido);

        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarPedidosPorUsuario(UUID usuarioId) {
        List<Pedido> pedidos = pedidoRepository.findByUsuarioId(usuarioId);
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
    public List<PedidoResponseDTO> listarPedidosPorLojistaEStatus(UUID lojistaId, Pedido.StatusPedido status) {
        List<Pedido> pedidos = pedidoRepository.findByLojistaIdAndStatus(lojistaId, status);
        return pedidoMapper.toResponseDTOList(pedidos);
    }

    @Transactional(readOnly = true)
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
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        pedido.setStatus(novoStatus);
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO confirmarPedido(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        pedido.setStatus(Pedido.StatusPedido.CONFIRMADO);
        pedido.setConfirmadoEm(OffsetDateTime.now());
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO cancelarPedido(UUID id, String motivo) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (pedido.getStatus() == Pedido.StatusPedido.ENTREGUE) {
            throw new RuntimeException("Não é possível cancelar um pedido já entregue");
        }
        
        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        // Você pode adicionar um campo de observações no pedido para armazenar o motivo
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO atribuirMotorista(UUID pedidoId, UUID motoristaId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        Motorista motorista = motoristaRepository.findById(motoristaId)
                .orElseThrow(() -> new RuntimeException("Motorista não encontrado"));
        
        pedido.setMotorista(motorista);
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    public PedidoResponseDTO marcarComoPreparando(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (pedido.getStatus() != Pedido.StatusPedido.CONFIRMADO) {
            throw new RuntimeException("Pedido deve estar confirmado para ser marcado como preparando");
        }
        
        return atualizarStatus(id, Pedido.StatusPedido.PREPARANDO);
    }

    public PedidoResponseDTO marcarComoPronto(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (pedido.getStatus() != Pedido.StatusPedido.PREPARANDO) {
            throw new RuntimeException("Pedido deve estar em preparação para ser marcado como pronto");
        }
        
        return atualizarStatus(id, Pedido.StatusPedido.PRONTO);
    }

    public PedidoResponseDTO marcarComoEmTransito(UUID id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
        
        if (pedido.getStatus() != Pedido.StatusPedido.PRONTO) {
            throw new RuntimeException("Pedido deve estar pronto para ser marcado como em trânsito");
        }
        
        if (pedido.getMotorista() == null) {
            throw new RuntimeException("É necessário atribuir um motorista antes de colocar o pedido em trânsito");
        }
        
        return atualizarStatus(id, Pedido.StatusPedido.EM_TRANSITO);
    }

    public PedidoResponseDTO marcarComoEntregue(UUID id, String codigoEntrega) {
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
        
        pedido.setStatus(Pedido.StatusPedido.ENTREGUE);
        pedido.setEntregueEm(OffsetDateTime.now());
        Pedido savedPedido = pedidoRepository.save(pedido);
        return pedidoMapper.toResponseDTO(savedPedido);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponseDTO> listarTodos() {
        List<Pedido> pedidos = pedidoRepository.findAll();
        return pedidoMapper.toResponseDTOList(pedidos);
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
