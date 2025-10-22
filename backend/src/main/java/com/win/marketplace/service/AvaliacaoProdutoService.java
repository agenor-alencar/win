package com.win.marketplace.service;

import com.win.marketplace.dto.request.AvaliacaoProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.AvaliacaoProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoProdutoResponseDTO;
import com.win.marketplace.dto.mapper.AvaliacaoProdutoMapper;
import com.win.marketplace.model.AvaliacaoProduto;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.repository.AvaliacaoProdutoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AvaliacaoProdutoService {

    private final AvaliacaoProdutoRepository avaliacaoRepository;
    private final ProdutoRepository produtoRepository;
    private final UsuarioRepository usuarioRepository;
    private final AvaliacaoProdutoMapper avaliacaoMapper;

    /**
     * Cria uma nova avaliação
     */
    public AvaliacaoProdutoResponseDTO criar(UUID usuarioId, AvaliacaoProdutoCreateRequestDTO requestDTO) {
        log.info("Criando avaliação para produto ID: {} por usuário ID: {}", requestDTO.produtoId(), usuarioId);
        
        // Verificar se produto existe
        Produto produto = produtoRepository.findById(requestDTO.produtoId())
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + requestDTO.produtoId()));

        // Verificar se usuário existe
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com ID: " + usuarioId));

        // Verificar se usuário já avaliou este produto
        if (avaliacaoRepository.existsByProdutoIdAndUsuarioId(requestDTO.produtoId(), usuarioId)) {
            throw new BusinessException("Você já avaliou este produto. Use atualizar ao invés de criar nova avaliação.");
        }

        AvaliacaoProduto avaliacao = avaliacaoMapper.toEntity(requestDTO);
        avaliacao.setProduto(produto);
        avaliacao.setUsuario(usuario);

        AvaliacaoProduto savedAvaliacao = avaliacaoRepository.save(avaliacao);
        log.info("Avaliação criada com sucesso. ID: {}", savedAvaliacao.getId());
        
        // Nota: O trigger do banco atualiza automaticamente produto.avaliacao e produto.quantidadeAvaliacoes
        
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    /**
     * Lista avaliações de um produto com paginação
     */
    @Transactional(readOnly = true)
    public Page<AvaliacaoProdutoResponseDTO> listarPorProduto(UUID produtoId, Pageable pageable) {
        log.info("Listando avaliações do produto ID: {}", produtoId);
        
        Page<AvaliacaoProduto> avaliacoes = avaliacaoRepository.findByProdutoId(produtoId, pageable);
        return avaliacoes.map(avaliacaoMapper::toResponseDTO);
    }

    /**
     * Lista avaliações feitas por um usuário
     */
    @Transactional(readOnly = true)
    public List<AvaliacaoProdutoResponseDTO> listarPorUsuario(UUID usuarioId) {
        log.info("Listando avaliações do usuário ID: {}", usuarioId);
        
        List<AvaliacaoProduto> avaliacoes = avaliacaoRepository.findByUsuarioId(usuarioId);
        return avaliacoes.stream()
                .map(avaliacaoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca avaliação por ID
     */
    @Transactional(readOnly = true)
    public AvaliacaoProdutoResponseDTO buscarPorId(UUID id) {
        log.info("Buscando avaliação ID: {}", id);
        
        AvaliacaoProduto avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada com ID: " + id));
        
        return avaliacaoMapper.toResponseDTO(avaliacao);
    }

    /**
     * Atualiza avaliação existente (apenas o próprio usuário pode atualizar)
     */
    public AvaliacaoProdutoResponseDTO atualizar(UUID id, UUID usuarioId, AvaliacaoProdutoUpdateRequestDTO requestDTO) {
        log.info("Atualizando avaliação ID: {}", id);
        
        AvaliacaoProduto avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada com ID: " + id));

        // Verificar se é o próprio usuário que está atualizando
        if (!avaliacao.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para atualizar esta avaliação");
        }

        if (requestDTO.nota() != null) {
            avaliacao.setNota(requestDTO.nota());
        }
        if (requestDTO.comentario() != null) {
            avaliacao.setComentario(requestDTO.comentario());
        }

        AvaliacaoProduto savedAvaliacao = avaliacaoRepository.save(avaliacao);
        log.info("Avaliação atualizada com sucesso. ID: {}", savedAvaliacao.getId());
        
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    /**
     * Deleta avaliação (apenas o próprio usuário ou admin pode deletar)
     */
    public void deletar(UUID id, UUID usuarioId) {
        log.info("Deletando avaliação ID: {}", id);
        
        AvaliacaoProduto avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Avaliação não encontrada com ID: " + id));

        // Verificar se é o próprio usuário que está deletando
        if (!avaliacao.getUsuario().getId().equals(usuarioId)) {
            throw new BusinessException("Você não tem permissão para deletar esta avaliação");
        }

        avaliacaoRepository.delete(avaliacao);
        log.info("Avaliação deletada com sucesso. ID: {}", id);
        
        // Nota: O trigger do banco atualiza automaticamente produto.avaliacao e produto.quantidadeAvaliacoes
    }
}
