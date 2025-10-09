package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.ProdutoCreateRequestDTO;
import com.win.marketplace.dto.request.ProdutoUpdateRequestDTO;
import com.win.marketplace.dto.response.ProdutoResponseDTO;
import com.win.marketplace.dto.response.ProdutoSummaryResponseDTO;
import com.win.marketplace.model.Produto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring", uses = {ImagemProdutoMapper.class, VariacaoProdutoMapper.class})
public interface ProdutoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "status", constant = "ATIVO")
    @Mapping(target = "avaliacaoMedia", constant = "0.0")
    @Mapping(target = "totalAvaliacoes", constant = "0")
    @Mapping(target = "variacoes", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "promocoes", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Produto toEntity(ProdutoCreateRequestDTO requestDTO);

    @Mapping(source = "lojista.id", target = "lojistaId")
    @Mapping(source = "lojista.nomeFantasia", target = "lojistaNome")
    @Mapping(source = "categoria.id", target = "categoriaId")
    @Mapping(source = "categoria.nome", target = "categoriaNome")
    ProdutoResponseDTO toResponseDTO(Produto produto);

    @Mapping(source = "categoria.nome", target = "categoriaNome")
    @Mapping(source = "lojista.nomeFantasia", target = "lojistaNome")
    @Mapping(target = "imagemPrincipal", expression = "java(getImagemPrincipal(produto))")
    ProdutoSummaryResponseDTO toSummaryResponseDTO(Produto produto);

    List<ProdutoResponseDTO> toResponseDTOList(List<Produto> produtos);

    List<ProdutoSummaryResponseDTO> toSummaryResponseDTOList(List<Produto> produtos);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "categoria", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "avaliacaoMedia", ignore = true)
    @Mapping(target = "totalAvaliacoes", ignore = true)
    @Mapping(target = "variacoes", ignore = true)
    @Mapping(target = "imagens", ignore = true)
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "promocoes", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    void updateEntityFromDTO(ProdutoUpdateRequestDTO requestDTO, @MappingTarget Produto produto);

    default String getImagemPrincipal(Produto produto) {
        if (produto.getImagens() != null && !produto.getImagens().isEmpty()) {
            return produto.getImagens().stream()
                    .filter(img -> img.getOrdemExibicao() != null && img.getOrdemExibicao() == 0)
                    .findFirst()
                    .map(img -> img.getUrl())
                    .orElse(produto.getImagens().get(0).getUrl());
        }
        return null;
    }
}
