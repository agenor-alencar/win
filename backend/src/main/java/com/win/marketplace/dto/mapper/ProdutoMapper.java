package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.ProdutoCreateRequestDTO;
import com.win.marketplace.dto.response.ProdutoResponseDTO;
import com.win.marketplace.dto.response.ProdutoSummaryResponseDTO;
import com.win.marketplace.model.Produto;
import com.win.marketplace.model.ImagemProduto;
import org.mapstruct.*;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProdutoMapper {

    /**
     * Converte ProdutoCreateRequestDTO para Produto (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    @Mapping(target = "itensPedido", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "avaliacao", ignore = true)
    @Mapping(target = "quantidadeAvaliacoes", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Produto toEntity(ProdutoCreateRequestDTO requestDTO);

    /**
     * Converte Produto (Entity) para ProdutoResponseDTO
     */
    @Mapping(target = "imagensUrls", expression = "java(mapImagensUrls(produto))")
    @Mapping(target = "lojista", source = "lojista")
    @Mapping(target = "categoria", source = "categoria")
    ProdutoResponseDTO toResponseDTO(Produto produto);

    /**
     * Converte Produto (Entity) para ProdutoSummaryResponseDTO
     */
    @Mapping(target = "imagemPrincipal", expression = "java(getImagemPrincipal(produto))")
    @Mapping(target = "nomeCategoria", source = "categoria.nome")
    @Mapping(target = "nomeLojista", source = "lojista.nomeFantasia")
    ProdutoSummaryResponseDTO toSummaryResponseDTO(Produto produto);

    /**
     * Mapeia Lojista para LojistaBasicInfoDTO
     */
    ProdutoResponseDTO.LojistaBasicInfoDTO toLojistaBasicInfo(com.win.marketplace.model.Lojista lojista);

    /**
     * Mapeia Categoria para CategoriaBasicInfoDTO
     */
    ProdutoResponseDTO.CategoriaBasicInfoDTO toCategoriaBasicInfo(com.win.marketplace.model.Categoria categoria);

    /**
     * Extrai URLs das imagens ordenadas
     */
    default List<String> mapImagensUrls(Produto produto) {
        if (produto.getImagens() == null || produto.getImagens().isEmpty()) {
            return List.of();
        }
        return produto.getImagens().stream()
                .sorted((a, b) -> Integer.compare(
                    a.getOrdemExibicao() != null ? a.getOrdemExibicao() : 999,
                    b.getOrdemExibicao() != null ? b.getOrdemExibicao() : 999
                ))
                .map(ImagemProduto::getUrl)
                .collect(Collectors.toList());
    }

    /**
     * Retorna URL da primeira imagem (principal)
     */
    default String getImagemPrincipal(Produto produto) {
        if (produto.getImagens() == null || produto.getImagens().isEmpty()) {
            return null;
        }
        return produto.getImagens().stream()
                .sorted((a, b) -> Integer.compare(
                    a.getOrdemExibicao() != null ? a.getOrdemExibicao() : 999,
                    b.getOrdemExibicao() != null ? b.getOrdemExibicao() : 999
                ))
                .findFirst()
                .map(ImagemProduto::getUrl)
                .orElse(null);
    }
}
