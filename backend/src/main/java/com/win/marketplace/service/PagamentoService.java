package com.win.marketplace.service;

import com.win.marketplace.dto.request.PagamentoRequestDTO;
import com.win.marketplace.dto.response.PagamentoResponseDTO;
import com.win.marketplace.dto.mapper.PagamentoMapper;
import com.win.marketplace.model.Pagamento;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.repository.PagamentoRepository;
import com.win.marketplace.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class PagamentoService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;
    private final PagamentoMapper pagamentoMapper;
    private final GatewayPagamentoService gatewayPagamentoService;
    private final NotificacaoService notificacaoService;

    public PagamentoResponseDTO processarPagamento(PagamentoRequestDTO requestDTO) {
        Pedido pedido = pedidoRepository.findById(requestDTO.pedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        // Verificar se já existe pagamento para este pedido
        if (pagamentoRepository.findByPedidoId(requestDTO.pedidoId()).isPresent()) {
            throw new RuntimeException("Pedido já possui pagamento associado");
        }

        Pagamento pagamento = pagamentoMapper.toEntity(requestDTO);
        pagamento.setPedido(pedido);
        pagamento.setDataCriacao(OffsetDateTime.now());

        // Processar pagamento através do gateway
        try {
            String codigoTransacao = gatewayPagamentoService.processarPagamento(requestDTO);
            pagamento.setCodigoTransacao(codigoTransacao);
            pagamento.setStatus(Pagamento.StatusPagamento.PROCESSANDO);
            pagamento.setDataProcessamento(OffsetDateTime.now());

        } catch (Exception e) {
            pagamento.setStatus(Pagamento.StatusPagamento.REJEITADO);
            pagamento.setObservacoes("Erro ao processar pagamento: " + e.getMessage());
        }

        Pagamento savedPagamento = pagamentoRepository.save(pagamento);

        // Enviar notificação
        notificacaoService.enviarNotificacaoPagamento(
            pedido.getCliente().getId(),
            savedPagamento.getId(),
            "Status do Pagamento",
            "Seu pagamento está sendo processado"
        );

        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    @Transactional(readOnly = true)
    public PagamentoResponseDTO buscarPorPedidoId(UUID pedidoId) {
        Pagamento pagamento = pagamentoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado para este pedido"));
        return pagamentoMapper.toResponseDTO(pagamento);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponseDTO> listarPorStatus(Pagamento.StatusPagamento status) {
        List<Pagamento> pagamentos = pagamentoRepository.findByStatus(status);
        return pagamentoMapper.toResponseDTOList(pagamentos);
    }

    @Transactional(readOnly = true)
    public List<PagamentoResponseDTO> listarPorMetodo(Pagamento.MetodoPagamento metodo) {
        List<Pagamento> pagamentos = pagamentoRepository.findByMetodoPagamento(metodo);
        return pagamentoMapper.toResponseDTOList(pagamentos);
    }

    public PagamentoResponseDTO aprovarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.APROVADO);
        pagamento.setDataProcessamento(OffsetDateTime.now());

        Pagamento savedPagamento = pagamentoRepository.save(pagamento);

        // Atualizar status do pedido
        Pedido pedido = pagamento.getPedido();
        pedido.setStatus(Pedido.StatusPedido.CONFIRMADO);
        pedido.setDataConfirmacao(OffsetDateTime.now());
        pedidoRepository.save(pedido);

        // Enviar notificação
        notificacaoService.enviarNotificacaoPagamento(
            pedido.getCliente().getId(),
            savedPagamento.getId(),
            "Pagamento Aprovado",
            "Seu pagamento foi aprovado com sucesso!"
        );

        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO rejeitarPagamento(UUID pagamentoId, String motivo) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        pagamento.setStatus(Pagamento.StatusPagamento.REJEITADO);
        pagamento.setObservacoes(motivo);
        pagamento.setDataProcessamento(OffsetDateTime.now());

        Pagamento savedPagamento = pagamentoRepository.save(pagamento);

        // Atualizar status do pedido
        Pedido pedido = pagamento.getPedido();
        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        pedidoRepository.save(pedido);

        // Enviar notificação
        notificacaoService.enviarNotificacaoPagamento(
            pedido.getCliente().getId(),
            savedPagamento.getId(),
            "Pagamento Rejeitado",
            "Seu pagamento foi rejeitado. Motivo: " + motivo
        );

        return pagamentoMapper.toResponseDTO(savedPagamento);
    }

    public PagamentoResponseDTO cancelarPagamento(UUID pagamentoId) {
        Pagamento pagamento = pagamentoRepository.findById(pagamentoId)
                .orElseThrow(() -> new RuntimeException("Pagamento não encontrado"));

        if (pagamento.getStatus() == Pagamento.StatusPagamento.APROVADO) {
            throw new RuntimeException("Não é possível cancelar pagamento já aprovado");
        }

        pagamento.setStatus(Pagamento.StatusPagamento.CANCELADO);
        pagamento.setDataProcessamento(OffsetDateTime.now());

        Pagamento savedPagamento = pagamentoRepository.save(pagamento);

        // Atualizar status do pedido
        Pedido pedido = pagamento.getPedido();
        pedido.setStatus(Pedido.StatusPedido.CANCELADO);
        pedidoRepository.save(pedido);

        return pagamentoMapper.toResponseDTO(savedPagamento);
    }
}
