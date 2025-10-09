package com.win.marketplace.service;

import com.win.marketplace.dto.request.NotificacaoRequestDTO;
import com.win.marketplace.dto.response.NotificacaoResponseDTO;
import com.win.marketplace.dto.mapper.NotificacaoMapper;
import com.win.marketplace.model.Notificacao;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.NotificacaoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoMapper notificacaoMapper;

    public NotificacaoResponseDTO criarNotificacao(NotificacaoRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Notificacao notificacao = notificacaoMapper.toEntity(requestDTO);
        notificacao.setUsuario(usuario);
        notificacao.setDataCriacao(OffsetDateTime.now());

        Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
        return notificacaoMapper.toResponseDTO(savedNotificacao);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarNotificacoesPorUsuario(UUID usuarioId) {
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioIdOrderByDataCriacaoDesc(usuarioId);
        return notificacaoMapper.toResponseDTOList(notificacoes);
    }

    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarNotificacoesNaoLidas(UUID usuarioId) {
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByDataCriacaoDesc(usuarioId);
        return notificacaoMapper.toResponseDTOList(notificacoes);
    }

    @Transactional(readOnly = true)
    public Long contarNotificacoesNaoLidas(UUID usuarioId) {
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    public NotificacaoResponseDTO marcarComoLida(UUID id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));

        notificacao.setLida(true);
        notificacao.setDataLeitura(OffsetDateTime.now());

        Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
        return notificacaoMapper.toResponseDTO(savedNotificacao);
    }

    public void marcarTodasComoLidas(UUID usuarioId) {
        List<Notificacao> notificacoesNaoLidas = notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByDataCriacaoDesc(usuarioId);

        OffsetDateTime agora = OffsetDateTime.now();
        notificacoesNaoLidas.forEach(notificacao -> {
            notificacao.setLida(true);
            notificacao.setDataLeitura(agora);
        });

        notificacaoRepository.saveAll(notificacoesNaoLidas);
    }

    public void deletarNotificacao(UUID id) {
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificação não encontrada"));
        notificacaoRepository.delete(notificacao);
    }

    public void enviarNotificacaoParaTodos(String mensagem, Notificacao.TipoNotificacao tipo, Notificacao.CanalNotificacao canal) {
        List<Usuario> usuarios = usuarioRepository.findByAtivoTrue();

        List<Notificacao> notificacoes = usuarios.stream()
                .map(usuario -> {
                    Notificacao notificacao = new Notificacao();
                    notificacao.setUsuario(usuario);
                    notificacao.setTitulo("Notificação do Sistema");
                    notificacao.setMensagem(mensagem);
                    notificacao.setTipo(tipo);
                    notificacao.setCanal(canal);
                    notificacao.setLida(false);
                    notificacao.setDataCriacao(OffsetDateTime.now());
                    return notificacao;
                })
                .toList();

        notificacaoRepository.saveAll(notificacoes);
    }

    public void enviarNotificacaoPedido(UUID usuarioId, UUID pedidoId, String titulo, String mensagem) {
        NotificacaoRequestDTO requestDTO = new NotificacaoRequestDTO(
                usuarioId,
                titulo,
                mensagem,
                "INFO",
                "SISTEMA",
                pedidoId,
                "PEDIDO"
        );
        criarNotificacao(requestDTO);
    }

    public void enviarNotificacaoPagamento(UUID usuarioId, UUID pagamentoId, String titulo, String mensagem) {
        NotificacaoRequestDTO requestDTO = new NotificacaoRequestDTO(
                usuarioId,
                titulo,
                mensagem,
                "INFO",
                "SISTEMA",
                pagamentoId,
                "PAGAMENTO"
        );
        criarNotificacao(requestDTO);
    }
}
