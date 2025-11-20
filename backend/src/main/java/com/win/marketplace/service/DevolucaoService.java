package com.win.marketplace.service;

import com.win.marketplace.dto.request.DevolucaoCreateRequestDTO;
import com.win.marketplace.dto.request.DevolucaoUpdateRequestDTO;
import com.win.marketplace.dto.response.DevolucaoResponseDTO;
import com.win.marketplace.dto.mapper.DevolucaoMapper;
import com.win.marketplace.model.*;
import com.win.marketplace.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DevolucaoService {

    private final DevolucaoRepository devolucaoRepository;
    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LojistaRepository lojistaRepository;
    private final DevolucaoMapper devolucaoMapper;

    /**
     * Cria uma nova solicitação de devolução
     */
    public DevolucaoResponseDTO criarDevolucao(UUID usuarioId, DevolucaoCreateRequestDTO requestDTO) {
        log.info("Criando solicitação de devolução para usuário: {}", usuarioId);

        // Buscar entidades relacionadas
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Pedido pedido = pedidoRepository.findById(requestDTO.pedidoId())
                .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));

        ItemPedido itemPedido = itemPedidoRepository.findById(requestDTO.itemPedidoId())
                .orElseThrow(() -> new RuntimeException("Item do pedido não encontrado"));

        // Verificar se o item pertence ao pedido
        if (!itemPedido.getPedido().getId().equals(pedido.getId())) {
            throw new RuntimeException("Item não pertence a este pedido");
        }

        // Buscar lojista do produto
        Lojista lojista = lojistaRepository.findById(itemPedido.getProduto().getLojista().getId())
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        // Criar devolução
        Devolucao devolucao = devolucaoMapper.toEntity(requestDTO);
        devolucao.setNumeroDevolucao(gerarNumeroDevolucao());
        devolucao.setPedido(pedido);
        devolucao.setItemPedido(itemPedido);
        devolucao.setUsuario(usuario);
        devolucao.setLojista(lojista);
        devolucao.setStatus(Devolucao.StatusDevolucao.PENDENTE);

        Devolucao savedDevolucao = devolucaoRepository.save(devolucao);
        log.info("Devolução criada com sucesso: {}", savedDevolucao.getNumeroDevolucao());

        return devolucaoMapper.toResponseDTO(savedDevolucao);
    }

    /**
     * Atualiza o status de uma devolução (ação do lojista)
     */
    public DevolucaoResponseDTO atualizarStatus(UUID devolucaoId, UUID lojistaId, DevolucaoUpdateRequestDTO requestDTO) {
        log.info("Atualizando status da devolução: {} pelo lojista: {}", devolucaoId, lojistaId);

        Devolucao devolucao = devolucaoRepository.findById(devolucaoId)
                .orElseThrow(() -> new RuntimeException("Devolução não encontrada"));

        // Verificar se a devolução pertence ao lojista
        if (!devolucao.getLojista().getId().equals(lojistaId)) {
            throw new RuntimeException("Devolução não pertence a este lojista");
        }

        // Atualizar status
        devolucao.setStatus(requestDTO.status());
        devolucao.setJustificativaLojista(requestDTO.justificativaLojista());

        // Atualizar datas conforme status
        OffsetDateTime now = OffsetDateTime.now();
        switch (requestDTO.status()) {
            case APROVADO:
                devolucao.setDataAprovacao(now);
                break;
            case RECUSADO:
                devolucao.setDataRecusa(now);
                break;
            case REEMBOLSADO:
                devolucao.setDataReembolso(now);
                break;
            case PENDENTE:
            case EM_TRANSITO:
            case RECEBIDO:
            case CANCELADO:
                // Não precisa atualizar datas específicas para esses status
                break;
        }

        Devolucao savedDevolucao = devolucaoRepository.save(devolucao);
        log.info("Status da devolução atualizado: {} -> {}", devolucaoId, requestDTO.status());

        return devolucaoMapper.toResponseDTO(savedDevolucao);
    }

    /**
     * Lista todas as devoluções de um lojista
     */
    @Transactional(readOnly = true)
    public List<DevolucaoResponseDTO> listarPorLojista(UUID lojistaId) {
        log.info("Listando devoluções do lojista: {}", lojistaId);
        List<Devolucao> devolucoes = devolucaoRepository.findByLojistaId(lojistaId);
        return devolucaoMapper.toResponseDTOList(devolucoes);
    }

    /**
     * Lista devoluções de um lojista filtradas por status
     */
    @Transactional(readOnly = true)
    public List<DevolucaoResponseDTO> listarPorLojistaEStatus(UUID lojistaId, Devolucao.StatusDevolucao status) {
        log.info("Listando devoluções do lojista: {} com status: {}", lojistaId, status);
        List<Devolucao> devolucoes = devolucaoRepository.findByLojistaIdAndStatus(lojistaId, status);
        return devolucaoMapper.toResponseDTOList(devolucoes);
    }

    /**
     * Lista devoluções de um usuário
     */
    @Transactional(readOnly = true)
    public List<DevolucaoResponseDTO> listarPorUsuario(UUID usuarioId) {
        log.info("Listando devoluções do usuário: {}", usuarioId);
        List<Devolucao> devolucoes = devolucaoRepository.findByUsuarioId(usuarioId);
        return devolucaoMapper.toResponseDTOList(devolucoes);
    }

    /**
     * Busca devolução por ID
     */
    @Transactional(readOnly = true)
    public DevolucaoResponseDTO buscarPorId(UUID id) {
        log.info("Buscando devolução por ID: {}", id);
        Devolucao devolucao = devolucaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Devolução não encontrada"));
        return devolucaoMapper.toResponseDTO(devolucao);
    }

    /**
     * Busca devolução por número
     */
    @Transactional(readOnly = true)
    public DevolucaoResponseDTO buscarPorNumero(String numeroDevolucao) {
        log.info("Buscando devolução por número: {}", numeroDevolucao);
        Devolucao devolucao = devolucaoRepository.findByNumeroDevolucao(numeroDevolucao)
                .orElseThrow(() -> new RuntimeException("Devolução não encontrada"));
        return devolucaoMapper.toResponseDTO(devolucao);
    }

    /**
     * Conta devoluções pendentes de um lojista
     */
    @Transactional(readOnly = true)
    public long contarPendentesPorLojista(UUID lojistaId) {
        return devolucaoRepository.countByLojistaIdAndStatus(lojistaId, Devolucao.StatusDevolucao.PENDENTE);
    }

    /**
     * Gera número único para devolução
     */
    private String gerarNumeroDevolucao() {
        String timestamp = OffsetDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        return "DEV-" + timestamp + "-" + random;
    }
}
