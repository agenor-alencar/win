package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.AvaliacaoRequestDTO;
import com.win.marketplace.dto.response.AvaliacaoResponseDTO;
import com.win.marketplace.model.Avaliacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface AvaliacaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    Avaliacao toEntity(AvaliacaoRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "produtoNome")
    @Mapping(source = "pedido.id", target = "pedidoId")
    AvaliacaoResponseDTO toResponseDTO(Avaliacao avaliacao);

    List<AvaliacaoResponseDTO> toResponseDTOList(List<Avaliacao> avaliacoes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "pedido", ignore = true)
    void updateEntityFromDTO(AvaliacaoRequestDTO requestDTO, @MappingTarget Avaliacao avaliacao);
}