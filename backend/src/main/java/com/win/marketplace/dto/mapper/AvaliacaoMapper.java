package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.model.Avaliacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AvaliacaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataAvaliacao", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "produto", ignore = true)
    Avaliacao toEntity(AvaliacaoRequestDTO requestDTO);

    @Mapping(source = "cliente.id", target = "clienteId")
    @Mapping(source = "cliente.nome", target = "clienteNome")
    @Mapping(target = "avaliadoId", expression = "java(getAvaliadoId(avaliacao))")
    @Mapping(target = "avaliadoNome", expression = "java(getAvaliadoNome(avaliacao))")
    @Mapping(target = "avaliadoTipo", expression = "java(getAvaliadoTipo(avaliacao))")
    @Mapping(source = "pedido.id", target = "pedidoId")
    AvaliacaoResponseDTO toResponseDTO(Avaliacao avaliacao);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataAvaliacao", ignore = true)
    @Mapping(target = "cliente", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "produto", ignore = true)
    void updateEntityFromDTO(AvaliacaoRequestDTO requestDTO, @MappingTarget Avaliacao avaliacao);

    default java.util.UUID getAvaliadoId(Avaliacao avaliacao) {
        if (avaliacao.getLojista() != null) {
            return avaliacao.getLojista().getId();
        } else if (avaliacao.getProduto() != null) {
            return avaliacao.getProduto().getId();
        }
        return null;
    }

    default String getAvaliadoNome(Avaliacao avaliacao) {
        if (avaliacao.getLojista() != null) {
            return avaliacao.getLojista().getNomeFantasia();
        } else if (avaliacao.getProduto() != null) {
            return avaliacao.getProduto().getNome();
        }
        return null;
    }

    default String getAvaliadoTipo(Avaliacao avaliacao) {
        if (avaliacao.getLojista() != null) {
            return "LOJISTA";
        } else if (avaliacao.getProduto() != null) {
            return "PRODUTO";
        }
        return null;
    }
}
