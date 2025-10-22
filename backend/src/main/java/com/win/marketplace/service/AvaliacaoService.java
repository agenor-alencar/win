package com.win.marketplace.service;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.dto.mapper.AvaliacaoMapper;
import com.win.marketplace.model.Avaliacao;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.model.Pedido;
import com.win.marketplace.model.Produto;
import com.win.marketplace.repository.AvaliacaoRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.PedidoRepository;
import com.win.marketplace.repository.ProdutoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProdutoRepository produtoRepository;
    private final AvaliacaoMapper avaliacaoMapper;

    public AvaliacaoResponseDTO criarAvaliacao(AvaliacaoRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Produto produto = produtoRepository.findById(requestDTO.produtoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Se pedidoId foi informado, validar
        Pedido pedido = null;
        if (requestDTO.pedidoId() != null) {
            pedido = pedidoRepository.findById(requestDTO.pedidoId())
                    .orElseThrow(() -> new RuntimeException("Pedido não encontrado"));
            
            // Verificar se o usuário já avaliou este produto neste pedido
            if (avaliacaoRepository.existsByUsuarioIdAndPedidoIdAndProdutoId(
                    requestDTO.usuarioId(), 
                    requestDTO.pedidoId(), 
                    requestDTO.produtoId())) {
                throw new RuntimeException("Você já avaliou este produto neste pedido");
            }
        } else {
            // Verificar se o usuário já avaliou este produto (sem pedido específico)
            if (avaliacaoRepository.existsByUsuarioIdAndProdutoIdAndPedidoIsNull(
                    requestDTO.usuarioId(), 
                    requestDTO.produtoId())) {
                throw new RuntimeException("Você já avaliou este produto");
            }
        }

        Avaliacao avaliacao = avaliacaoMapper.toEntity(requestDTO);
        avaliacao.setUsuario(usuario);
        avaliacao.setProduto(produto);
        avaliacao.setPedido(pedido);

        Avaliacao savedAvaliacao = avaliacaoRepository.save(avaliacao);
        
        // Atualizar média de avaliações do produto
        atualizarMediaProduto(produto.getId());
        
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorProduto(UUID produtoId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoId(produtoId);
        return avaliacaoMapper.toResponseDTOList(avaliacoes);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorUsuario(UUID usuarioId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByUsuarioId(usuarioId);
        return avaliacaoMapper.toResponseDTOList(avaliacoes);
    }

    @Transactional(readOnly = true)
    public List<AvaliacaoResponseDTO> listarAvaliacoesPorPedido(UUID pedidoId) {
        List<Avaliacao> avaliacoes = avaliacaoRepository.findByPedidoId(pedidoId);
        return avaliacaoMapper.toResponseDTOList(avaliacoes);
    }

    @Transactional(readOnly = true)
    public AvaliacaoResponseDTO buscarPorId(UUID id) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avaliação não encontrada"));
        return avaliacaoMapper.toResponseDTO(avaliacao);
    }

    public AvaliacaoResponseDTO atualizarAvaliacao(UUID id, AvaliacaoRequestDTO requestDTO) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avaliação não encontrada"));

        // Verificar se o usuário é o dono da avaliação
        if (!avaliacao.getUsuario().getId().equals(requestDTO.usuarioId())) {
            throw new RuntimeException("Você não tem permissão para editar esta avaliação");
        }

        avaliacaoMapper.updateEntityFromDTO(requestDTO, avaliacao);
        
        Avaliacao savedAvaliacao = avaliacaoRepository.save(avaliacao);
        
        // Atualizar média de avaliações do produto
        atualizarMediaProduto(avaliacao.getProduto().getId());
        
        return avaliacaoMapper.toResponseDTO(savedAvaliacao);
    }

    public void deletarAvaliacao(UUID id, UUID usuarioId) {
        Avaliacao avaliacao = avaliacaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Avaliação não encontrada"));

        // Verificar se o usuário é o dono da avaliação
        if (!avaliacao.getUsuario().getId().equals(usuarioId)) {
            throw new RuntimeException("Você não tem permissão para deletar esta avaliação");
        }

        UUID produtoId = avaliacao.getProduto().getId();
        
        avaliacaoRepository.delete(avaliacao);
        
        // Atualizar média de avaliações do produto
        atualizarMediaProduto(produtoId);
    }

    private void atualizarMediaProduto(UUID produtoId) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        List<Avaliacao> avaliacoes = avaliacaoRepository.findByProdutoId(produtoId);
        
        if (!avaliacoes.isEmpty()) {
            double media = avaliacoes.stream()
                    .mapToInt(Avaliacao::getNota)
                    .average()
                    .orElse(0.0);
            
            produto.setAvaliacao(java.math.BigDecimal.valueOf(media));
            produto.setQuantidadeAvaliacoes(avaliacoes.size());
        } else {
            produto.setAvaliacao(java.math.BigDecimal.ZERO);
            produto.setQuantidadeAvaliacoes(0);
        }
        
        produtoRepository.save(produto);
    }
}
