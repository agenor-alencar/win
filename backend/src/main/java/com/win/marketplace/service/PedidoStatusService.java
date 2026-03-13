package com.win.marketplace.service;

import com.win.marketplace.exception.BusinessException;
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.PedidoStatusHistorico;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.PedidoStatusHistoricoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PedidoStatusService {

    private final PedidoRepository pedidoRepository;
    private final PedidoStatusHistoricoRepository historicoRepository;
    private final NotificacaoService notificacaoService;
    private final UsuarioRepository usuarioRepository;

    public Pedido transicionarStatus(UUID pedidoId, Pedido.StatusPedido novoStatus) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new ResourceNotFoundException("Pedido não encontrado com ID: " + pedidoId));

        Pedido.StatusPedido statusAnterior = pedido.getStatus();

        if (statusAnterior == novoStatus) {
            throw new BusinessException("Pedido já está no status " + novoStatus);
        }

        validarTransicao(pedido, novoStatus);

        aplicarEfeitosStatus(pedido, novoStatus);
        pedido.setStatus(novoStatus);

        Pedido pedidoAtualizado = pedidoRepository.save(pedido);

        try {
            registrarHistorico(pedidoAtualizado, statusAnterior, novoStatus);
        } catch (Exception exception) {
            log.error(
                    "Falha ao registrar histórico de status do pedido {}: {}",
                    pedidoAtualizado.getNumeroPedido(),
                    exception.getMessage(),
                    exception
            );
        }

        try {
            enviarNotificacoes(pedidoAtualizado, statusAnterior, novoStatus);
        } catch (Exception exception) {
            log.error(
                    "Falha ao enviar notificações do pedido {}: {}",
                    pedidoAtualizado.getNumeroPedido(),
                    exception.getMessage(),
                    exception
            );
        }

        log.info("Status do pedido {} alterado de {} para {}",
                pedidoAtualizado.getNumeroPedido(), statusAnterior, novoStatus);

        return pedidoAtualizado;
    }

    private void validarTransicao(Pedido pedido, Pedido.StatusPedido novoStatus) {
        Pedido.StatusPedido atual = pedido.getStatus();

        if (novoStatus == Pedido.StatusPedido.CANCELADO) {
            validarCancelamento(pedido);
            return;
        }

        boolean transicaoValida = switch (atual) {
            case PENDENTE -> novoStatus == Pedido.StatusPedido.CONFIRMADO;
            case CONFIRMADO -> novoStatus == Pedido.StatusPedido.PREPARANDO;
            case PREPARANDO -> novoStatus == Pedido.StatusPedido.PRONTO;
            case PRONTO -> novoStatus == Pedido.StatusPedido.EM_TRANSITO;
            case EM_TRANSITO -> novoStatus == Pedido.StatusPedido.ENTREGUE;
            case ENTREGUE, CANCELADO -> false;
        };

        if (!transicaoValida) {
            throw new BusinessException(
                    "Transição de status inválida: " + atual + " -> " + novoStatus
            );
        }

        if (atual == Pedido.StatusPedido.PENDENTE && novoStatus == Pedido.StatusPedido.CONFIRMADO) {
            if (pedido.getStatusPagamento() != Pedido.StatusPagamento.APROVADO) {
                throw new BusinessException("Pedido só pode ser confirmado após pagamento aprovado");
            }
        }

        if (atual == Pedido.StatusPedido.PRONTO && novoStatus == Pedido.StatusPedido.EM_TRANSITO) {
            if (pedido.getMotorista() == null) {
                throw new BusinessException("É necessário atribuir um motorista antes de iniciar trânsito");
            }
        }
    }

    private void validarCancelamento(Pedido pedido) {
        if (pedido.getStatus() == Pedido.StatusPedido.ENTREGUE) {
            throw new BusinessException("Não é possível cancelar pedido já entregue");
        }

        if (pedido.getStatus() == Pedido.StatusPedido.CANCELADO) {
            throw new BusinessException("Pedido já está cancelado");
        }
    }

    private void aplicarEfeitosStatus(Pedido pedido, Pedido.StatusPedido novoStatus) {
        if (novoStatus == Pedido.StatusPedido.CONFIRMADO && pedido.getConfirmadoEm() == null) {
            pedido.setConfirmadoEm(OffsetDateTime.now());
        }

        if (novoStatus == Pedido.StatusPedido.ENTREGUE) {
            pedido.setEntregueEm(OffsetDateTime.now());
        }
    }

    private void registrarHistorico(Pedido pedido, Pedido.StatusPedido statusAnterior, Pedido.StatusPedido statusNovo) {
        PedidoStatusHistorico historico = new PedidoStatusHistorico();
        historico.setPedido(pedido);
        historico.setStatusAnterior(statusAnterior);
        historico.setStatusNovo(statusNovo);
        historico.setObservacao("Transição automática de status");

        historicoRepository.save(historico);
    }

    private void enviarNotificacoes(Pedido pedido, Pedido.StatusPedido statusAnterior, Pedido.StatusPedido statusNovo) {
        String titulo = "Atualização do seu pedido #" + pedido.getNumeroPedido();
        String mensagemCliente = "Status alterado de " + statusAnterior + " para " + statusNovo + ".";

        notificacaoService.enviarNotificacaoPedido(
                pedido.getUsuario().getId(),
                titulo,
                mensagemCliente
        );

        List<Usuario> admins = usuarioRepository.findByPerfilAtivo("ADMIN");
        for (Usuario admin : admins) {
            notificacaoService.enviarNotificacaoPedido(
                    admin.getId(),
                    "Pedido " + pedido.getNumeroPedido() + " alterado",
                    "Pedido " + pedido.getNumeroPedido() + " mudou de " + statusAnterior + " para " + statusNovo + "."
            );
        }
    }
}
