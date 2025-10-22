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
import com.win.marketplace.exception.ResourceNotFoundException;
import com.win.marketplace.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final LojistaRepository lojistaRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProdutoMapper produtoMapper;

    /**
     * Cria um novo produto
     */
    public ProdutoResponseDTO criarProduto(UUID lojistaId, ProdutoCreateRequestDTO requestDTO) {
        log.info("Criando produto para lojista ID: {}", lojistaId);
        
        // Validar lojista
        Lojista lojista = lojistaRepository.findById(lojistaId)
                .orElseThrow(() -> new ResourceNotFoundException("Lojista não encontrado com ID: " + lojistaId));

        // Validar se lojista está ativo
        if (!lojista.getAtivo()) {
            throw new BusinessException("Lojista está inativo e não pode cadastrar produtos");
        }

        // Validar categoria
        Categoria categoria = categoriaRepository.findById(requestDTO.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + requestDTO.categoriaId()));

        // Converter DTO para entidade
        Produto produto = produtoMapper.toEntity(requestDTO);
        produto.setLojista(lojista);
        produto.setCategoria(categoria);
        
        // Valores padrão
        if (produto.getAtivo() == null) {
            produto.setAtivo(true);
        }
        if (produto.getEstoque() == null) {
            produto.setEstoque(0);
        }

        Produto savedProduto = produtoRepository.save(produto);
        log.info("Produto criado com sucesso. ID: {}", savedProduto.getId());
        
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Lista produtos com paginação (apenas ativos)
     */
    @Transactional(readOnly = true)
    public Page<ProdutoSummaryResponseDTO> listarProdutosPaginados(Pageable pageable) {
        log.info("Listando produtos paginados - Página: {}, Tamanho: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<Produto> produtos = produtoRepository.findByAtivoTrueOrderByCriadoEmDesc(pageable);
        return produtos.map(produtoMapper::toSummaryResponseDTO);
    }

    /**
     * Lista todos os produtos de um lojista
     */
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorLojista(UUID lojistaId) {
        log.info("Listando produtos do lojista ID: {}", lojistaId);
        
        // Verificar se lojista existe
        if (!lojistaRepository.existsById(lojistaId)) {
            throw new ResourceNotFoundException("Lojista não encontrado com ID: " + lojistaId);
        }
        
        List<Produto> produtos = produtoRepository.findByLojistaId(lojistaId);
        return produtos.stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista produtos por categoria (apenas ativos)
     */
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> listarProdutosPorCategoria(UUID categoriaId) {
        log.info("Listando produtos da categoria ID: {}", categoriaId);
        
        // Verificar se categoria existe
        if (!categoriaRepository.existsById(categoriaId)) {
            throw new ResourceNotFoundException("Categoria não encontrada com ID: " + categoriaId);
        }
        
        List<Produto> produtos = produtoRepository.findByCategoriaIdAndAtivoTrue(categoriaId);
        return produtos.stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca produtos por nome (busca parcial, case insensitive)
     */
    @Transactional(readOnly = true)
    public List<ProdutoResponseDTO> buscarProdutosPorNome(String nome) {
        log.info("Buscando produtos com nome contendo: {}", nome);
        
        if (nome == null || nome.trim().isEmpty()) {
            throw new BusinessException("Nome de busca não pode ser vazio");
        }
        
        List<Produto> produtos = produtoRepository.findByNomeContainingIgnoreCaseAndAtivoTrue(nome);
        return produtos.stream()
                .map(produtoMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca produto por ID
     */
    @Transactional(readOnly = true)
    public ProdutoResponseDTO buscarPorId(UUID id) {
        log.info("Buscando produto por ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        return produtoMapper.toResponseDTO(produto);
    }

    /**
     * Atualiza produto existente
     */
    public ProdutoResponseDTO atualizarProduto(UUID id, ProdutoUpdateRequestDTO requestDTO) {
        log.info("Atualizando produto ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));

        // Se categoria foi alterada, validar se existe
        if (requestDTO.categoriaId() != null && !requestDTO.categoriaId().equals(produto.getCategoria().getId())) {
            Categoria novaCategoria = categoriaRepository.findById(requestDTO.categoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoria não encontrada com ID: " + requestDTO.categoriaId()));
            produto.setCategoria(novaCategoria);
        }

        // Atualizar campos
        if (requestDTO.nome() != null) {
            produto.setNome(requestDTO.nome());
        }
        if (requestDTO.descricao() != null) {
            produto.setDescricao(requestDTO.descricao());
        }
        if (requestDTO.preco() != null) {
            if (requestDTO.preco().compareTo(java.math.BigDecimal.ZERO) <= 0) {
                throw new BusinessException("Preço deve ser maior que zero");
            }
            produto.setPreco(requestDTO.preco());
        }
        if (requestDTO.estoque() != null) {
            if (requestDTO.estoque() < 0) {
                throw new BusinessException("Estoque não pode ser negativo");
            }
            produto.setEstoque(requestDTO.estoque());
        }
        if (requestDTO.pesoKg() != null) {
            produto.setPesoKg(requestDTO.pesoKg());
        }
        if (requestDTO.comprimentoCm() != null) {
            produto.setComprimentoCm(requestDTO.comprimentoCm());
        }
        if (requestDTO.larguraCm() != null) {
            produto.setLarguraCm(requestDTO.larguraCm());
        }
        if (requestDTO.alturaCm() != null) {
            produto.setAlturaCm(requestDTO.alturaCm());
        }

        Produto savedProduto = produtoRepository.save(produto);
        log.info("Produto atualizado com sucesso. ID: {}", savedProduto.getId());
        
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Ativa um produto
     */
    public ProdutoResponseDTO ativarProduto(UUID id) {
        log.info("Ativando produto ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        produto.setAtivo(true);
        Produto savedProduto = produtoRepository.save(produto);
        
        log.info("Produto ativado com sucesso. ID: {}", savedProduto.getId());
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Desativa um produto
     */
    public ProdutoResponseDTO desativarProduto(UUID id) {
        log.info("Desativando produto ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        produto.setAtivo(false);
        Produto savedProduto = produtoRepository.save(produto);
        
        log.info("Produto desativado com sucesso. ID: {}", savedProduto.getId());
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Atualiza estoque do produto
     */
    public ProdutoResponseDTO atualizarEstoque(UUID id, Integer novaQuantidade) {
        log.info("Atualizando estoque do produto ID: {} para quantidade: {}", id, novaQuantidade);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        if (novaQuantidade < 0) {
            throw new BusinessException("Quantidade de estoque não pode ser negativa");
        }
        
        produto.setEstoque(novaQuantidade);
        Produto savedProduto = produtoRepository.save(produto);
        
        log.info("Estoque atualizado com sucesso. Produto ID: {}, Nova quantidade: {}", savedProduto.getId(), novaQuantidade);
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Incrementa estoque do produto
     */
    public ProdutoResponseDTO incrementarEstoque(UUID id, Integer quantidade) {
        log.info("Incrementando estoque do produto ID: {} em {} unidades", id, quantidade);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        if (quantidade <= 0) {
            throw new BusinessException("Quantidade para incrementar deve ser maior que zero");
        }
        
        produto.setEstoque(produto.getEstoque() + quantidade);
        Produto savedProduto = produtoRepository.save(produto);
        
        log.info("Estoque incrementado com sucesso. Produto ID: {}, Novo estoque: {}", savedProduto.getId(), savedProduto.getEstoque());
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Decrementa estoque do produto
     */
    public ProdutoResponseDTO decrementarEstoque(UUID id, Integer quantidade) {
        log.info("Decrementando estoque do produto ID: {} em {} unidades", id, quantidade);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));
        
        if (quantidade <= 0) {
            throw new BusinessException("Quantidade para decrementar deve ser maior que zero");
        }
        
        int novoEstoque = produto.getEstoque() - quantidade;
        if (novoEstoque < 0) {
            throw new BusinessException("Estoque insuficiente. Disponível: " + produto.getEstoque() + ", Solicitado: " + quantidade);
        }
        
        produto.setEstoque(novoEstoque);
        Produto savedProduto = produtoRepository.save(produto);
        
        log.info("Estoque decrementado com sucesso. Produto ID: {}, Novo estoque: {}", savedProduto.getId(), savedProduto.getEstoque());
        return produtoMapper.toResponseDTO(savedProduto);
    }

    /**
     * Deleta produto (soft delete - apenas desativa)
     */
    public void deletarProduto(UUID id) {
        log.info("Deletando produto ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));

        // Verificar se existem pedidos com este produto
        long countPedidos = produtoRepository.countItensPedidoByProdutoId(id);
        if (countPedidos > 0) {
            throw new BusinessException("Não é possível deletar produto que possui " + countPedidos + " pedido(s) associado(s). Desative-o ao invés de deletar.");
        }

        // Soft delete - apenas desativa
        produto.setAtivo(false);
        produtoRepository.save(produto);
        
        log.info("Produto desativado (soft delete) com sucesso. ID: {}", id);
    }

    /**
     * Deleta produto permanentemente (hard delete)
     */
    public void deletarProdutoPermanentemente(UUID id) {
        log.info("Deletando PERMANENTEMENTE produto ID: {}", id);
        
        Produto produto = produtoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Produto não encontrado com ID: " + id));

        // Verificar se existem pedidos com este produto
        long countPedidos = produtoRepository.countItensPedidoByProdutoId(id);
        if (countPedidos > 0) {
            throw new BusinessException("Não é possível deletar permanentemente produto que possui " + countPedidos + " pedido(s) associado(s)");
        }

        produtoRepository.delete(produto);
        log.warn("Produto deletado PERMANENTEMENTE. ID: {}", id);
    }

    /**
     * Lista produtos mais vendidos
     */
    @Transactional(readOnly = true)
    public List<ProdutoSummaryResponseDTO> listarMaisVendidos(int limite) {
        log.info("Listando {} produtos mais vendidos", limite);
        
        Pageable pageable = PageRequest.of(0, limite);
        List<Produto> produtos = produtoRepository.findProdutosMaisVendidos(pageable);
        
        return produtos.stream()
                .map(produtoMapper::toSummaryResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Lista produtos mais bem avaliados
     */
    @Transactional(readOnly = true)
    public List<ProdutoSummaryResponseDTO> listarMaisAvaliados(int limite) {
        log.info("Listando {} produtos mais avaliados", limite);
        
        Pageable pageable = PageRequest.of(0, limite);
        List<Produto> produtos = produtoRepository.findProdutosMaisAvaliados(pageable);
        
        return produtos.stream()
                .map(produtoMapper::toSummaryResponseDTO)
                .collect(Collectors.toList());
    }
}
