package com.win.marketplace.service;

import com.win.marketplace.dto.request.NotificacaoRequestDTO;
import com.win.marketplace.dto.response.NotificacaoResponseDTO;
import com.win.marketplace.dto.mapper.NotificacaoMapper;
import com.win.marketplace.model.Notificacao;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.NotificacaoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.exception.ResourceNotFoundException; 
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class NotificacaoService {

    private final NotificacaoRepository notificacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacaoMapper notificacaoMapper;

    // ✅ Tipos e canais válidos
    private static final Set<String> TIPOS_VALIDOS = Set.of("INFO", "AVISO", "ERRO", "SUCESSO");
    private static final Set<String> CANAIS_VALIDOS = Set.of("SISTEMA", "EMAIL", "SMS", "PUSH");

    /**
     * Cria uma nova notificação
     */
    public NotificacaoResponseDTO criarNotificacao(NotificacaoRequestDTO requestDTO) {
        log.info("Criando notificação para usuário ID: {}", requestDTO.usuarioId());
        
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + requestDTO.usuarioId()));

        Notificacao notificacao = notificacaoMapper.toEntity(requestDTO);
        notificacao.setUsuario(usuario);

        Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
        log.info("Notificação criada com sucesso. ID: {}", savedNotificacao.getId());
        
        return notificacaoMapper.toResponseDTO(savedNotificacao);
    }

    /**
     * Lista notificações de um usuário ordenadas por data
     */
    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarNotificacoesPorUsuario(UUID usuarioId) {
        log.info("Listando notificações do usuário ID: {}", usuarioId);
        
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioIdOrderByCriadoEmDesc(usuarioId);
        
        return notificacoes.stream()
                .map(notificacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista notificações não lidas de um usuário
     */
    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarNotificacoesNaoLidas(UUID usuarioId) {
        log.info("Listando notificações não lidas do usuário ID: {}", usuarioId);
        
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByCriadoEmDesc(usuarioId);
        
        return notificacoes.stream()
                .map(notificacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Conta notificações não lidas de um usuário
     */
    @Transactional(readOnly = true)
    public Long contarNotificacoesNaoLidas(UUID usuarioId) {
        log.info("Contando notificações não lidas do usuário ID: {}", usuarioId);
        
        return notificacaoRepository.countByUsuarioIdAndLidaFalse(usuarioId);
    }

    /**
     * Marca uma notificação como lida
     */
    public NotificacaoResponseDTO marcarComoLida(UUID id) {
        log.info("Marcando notificação ID: {} como lida", id);
        
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com ID: " + id));

        notificacao.setLida(true);
        notificacao.setDataLeitura(OffsetDateTime.now());

        Notificacao savedNotificacao = notificacaoRepository.save(notificacao);
        log.info("Notificação marcada como lida");
        
        return notificacaoMapper.toResponseDTO(savedNotificacao);
    }

    /**
     * Marca todas as notificações de um usuário como lidas
     */
    public void marcarTodasComoLidas(UUID usuarioId) {
        log.info("Marcando todas as notificações do usuário ID: {} como lidas", usuarioId);
        
        List<Notificacao> notificacoesNaoLidas = notificacaoRepository.findByUsuarioIdAndLidaFalseOrderByCriadoEmDesc(usuarioId);

        OffsetDateTime agora = OffsetDateTime.now();
        notificacoesNaoLidas.forEach(notificacao -> {
            notificacao.setLida(true);
            notificacao.setDataLeitura(agora);
        });

        notificacaoRepository.saveAll(notificacoesNaoLidas);
        log.info("{} notificações marcadas como lidas", notificacoesNaoLidas.size());
    }

    /**
     * Deleta uma notificação
     */
    public void deletarNotificacao(UUID id) {
        log.info("Deletando notificação ID: {}", id);
        
        Notificacao notificacao = notificacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com ID: " + id));
        
        notificacaoRepository.delete(notificacao);
        log.info("Notificação deletada com sucesso");
    }

    /**
     * Envia notificação para todos os usuários ativos
     */
    public void enviarNotificacaoParaTodos(String titulo, String mensagem, String tipo, String canal) {
        log.info("Enviando notificação para todos os usuários ativos");
        
        // Validar tipo e canal
        if (!TIPOS_VALIDOS.contains(tipo.toUpperCase())) {
            throw new IllegalArgumentException("Tipo de notificação inválido: " + tipo);
        }
        if (!CANAIS_VALIDOS.contains(canal.toUpperCase())) {
            throw new IllegalArgumentException("Canal de notificação inválido: " + canal);
        }
        
        List<Usuario> usuarios = usuarioRepository.findByAtivoTrue();

        List<Notificacao> notificacoes = usuarios.stream()
                .map(usuario -> {
                    Notificacao notificacao = new Notificacao();
                    notificacao.setUsuario(usuario);
                    notificacao.setTitulo(titulo);
                    notificacao.setMensagem(mensagem);
                    notificacao.setTipo(tipo.toUpperCase());
                    notificacao.setCanal(canal.toUpperCase());
                    notificacao.setLida(false);
                    return notificacao;
                })
                .collect(Collectors.toList());

        notificacaoRepository.saveAll(notificacoes);
        log.info("Notificação enviada para {} usuários", notificacoes.size());
    }

    /**
     * Envia notificação relacionada a pedido
     */
    public void enviarNotificacaoPedido(UUID usuarioId, String titulo, String mensagem) {
        log.info("Enviando notificação de pedido para usuário ID: {}", usuarioId);
        
        NotificacaoRequestDTO requestDTO = new NotificacaoRequestDTO(
                usuarioId,
                "INFO",
                titulo,
                mensagem,
                "SISTEMA"
        );
        criarNotificacao(requestDTO);
    }

    /**
     * Envia notificação relacionada a pagamento
     */
    public void enviarNotificacaoPagamento(UUID usuarioId, String titulo, String mensagem) {
        log.info("Enviando notificação de pagamento para usuário ID: {}", usuarioId);
        
        NotificacaoRequestDTO requestDTO = new NotificacaoRequestDTO(
                usuarioId,
                "INFO",
                titulo,
                mensagem,
                "SISTEMA"
        );
        criarNotificacao(requestDTO);
    }

    /**
     * Lista todas as notificações
     */
    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> listarTodos() {
        log.info("Listando todas as notificações");
        
        List<Notificacao> notificacoes = notificacaoRepository.findAll();
        
        return notificacoes.stream()
                .map(notificacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca notificações por usuário
     */
    @Transactional(readOnly = true)
    public List<NotificacaoResponseDTO> buscarPorUsuario(UUID usuarioId) {
        log.info("Buscando notificações do usuário ID: {}", usuarioId);
        
        List<Notificacao> notificacoes = notificacaoRepository.findByUsuarioId(usuarioId);
        
        return notificacoes.stream()
                .map(notificacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }
}
