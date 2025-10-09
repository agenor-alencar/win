package com.win.marketplace.service;

import com.win.marketplace.dto.request.ProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.ProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.ProdutoResponseDTO;
import com.win.marketplace.dto.response.ProdutoSummaryResponseDTO;
import com.win.marketplace.dto.mapper.ProdutoMapper;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.Lojista;
import com.win.marketplace.model.Categoria;
import com.win.marketplace.repository.ProdutoRepository;
import com.win.marketplace.repository.LojistaRepository;
import com.win.marketplace.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final LojistaRepository lojistaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoMapper produtoMapper;

    public ProdutoResponseDTO criarProduto(UUID lojistaId, ProdutoCreateRequestDTO requestDTO) {
        Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new RuntimeException("Lojista não encontrado"));

        Categoria categoria = categoriaRepository.findById(requestDTO.categoriaId())
                .orElseThrow(() -> new RuntimeException("Categoria não encontrada"));

        Produto produto = produtoMapper.toEntity(requestDTO);
        produto.setLojista(lojista);
        produto.setCategoria(categoria);
        produto.setDataCriacao(OffsetDateTime.now());
        produto.setDataAtualizacao(OffsetDateTime.now());

        Produto savedProduto = produtoRepository.save(produto);
        return produtoMapper.toResponseDTO(savedProduto);
    }

    @Transactional(readOnly = true)
    public Page<ProdutoSummaryResponseDTO> listarProdutosPaginados(Pageable pageable) {
        Page<Produto> produtos = produtoRepository.findByStatusOrderByDataCriacaoDesc(Produto.StatusProduto.ATIVO, pageable);
        return produtos.map(produtoMapper::toSummaryResponseDTO);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorLojista(UUID lojistaId) {
        List<Produto> produtos = produtoRepository.findByLojistaId(lojistaId);
        return produtoMapper.toResponseDTOList(produtos);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorCategoria(UUID categoriaId) {
        List<Produto> produtos = produtoRepository.findByCategoriaId(categoriaId);
        return produtoMapper.toResponseDTOList(produtos);
    }

    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> buscarProdutosPorNome(String nome) {
        List<Produto> produtos = produtoRepository.findByNomeContainingIgnoreCase(nome);
        return produtoMapper.toResponseDTOList(produtos);
    }

    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(UUID id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        return produtoMapper.toResponseDTO(produto);
    }

    public ProdutoResponseDTO atualizarProduto(UUID id, ProdutoUpdateRequestDTO requestDTO) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Se categoria foi alterada, validar se existe
        if (requestDTO.categoriaId() != null && !requestDTO.categoriaId().equals(produto.getCategoria().getId())) {
            Categoria novaCategoria = categoriaRepository.findById(requestDTO.categoriaId())
                    .orElseThrow(() -> new RuntimeException("Nova categoria não encontrada"));
            produto.setCategoria(novaCategoria);
        }

        produtoMapper.updateEntityFromDTO(requestDTO, produto);
        produto.setDataAtualizacao(OffsetDateTime.now());

        Produto savedProduto = produtoRepository.save(produto);
        return produtoMapper.toResponseDTO(savedProduto);
    }

    public void atualizarStatusProduto(UUID id, Produto.StatusProduto novoStatus) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setStatus(novoStatus);
        produto.setDataAtualizacao(OffsetDateTime.now());
        produtoRepository.save(produto);
    }

    public void deletarProduto(UUID id) {
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        // Verificar se existem pedidos com este produto
        if (!produto.getItens().isEmpty()) {
            throw new RuntimeException("Não é possível deletar produto que possui pedidos associados");
        }

        produtoRepository.delete(produto);
    }

    public void atualizarEstoque(UUID produtoId, Integer novaQuantidade) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        produto.setEstoque(novaQuantidade);
        produto.setDataAtualizacao(OffsetDateTime.now());

        // Atualizar status baseado no estoque
        if (novaQuantidade <= 0) {
            produto.setStatus(Produto.StatusProduto.INDISPONIVEL);
        } else if (produto.getStatus() == Produto.StatusProduto.INDISPONIVEL) {
            produto.setStatus(Produto.StatusProduto.ATIVO);
        }

        produtoRepository.save(produto);
    }

    public void atualizarAvaliacaoMedia(UUID produtoId) {
        Produto produto = produtoRepository.findById(produtoId)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (produto.getAvaliacoes() != null && !produto.getAvaliacoes().isEmpty()) {
            double media = produto.getAvaliacoes().stream()
                    .mapToInt(avaliacao -> avaliacao.getNota())
                    .average()
                    .orElse(0.0);

            produto.setAvaliacaoMedia(java.math.BigDecimal.valueOf(media));
            produto.setTotalAvaliacoes(produto.getAvaliacoes().size());
        } else {
            produto.setAvaliacaoMedia(java.math.BigDecimal.ZERO);
            produto.setTotalAvaliacoes(0);
        }

        produtoRepository.save(produto);
    }
}
