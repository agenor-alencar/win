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
}
