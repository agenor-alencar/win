package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.PromocaoRequestDTO;
import com.win.marketplace.dto.response.PromocaoResponseDTO;
import com.win.marketplace.model.Promocao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.BeanMapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface PromocaoMapper {

    /**
     * Converte PromocaoRequestDTO para Promocao (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "ativa", constant = "true")
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    Promocao toEntity(PromocaoRequestDTO requestDTO);

    /**
     * Converte Promocao (Entity) para PromocaoResponseDTO
     */
    @Mapping(source = "produto.id", target = "produtoId")
    @Mapping(source = "produto.nome", target = "nomeProduto")
    PromocaoResponseDTO toResponseDTO(Promocao promocao);

    /**
     * Atualiza uma entidade Promocao existente com dados do PromocaoRequestDTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "produto", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "atualizadoEm", ignore = true)
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDTO(PromocaoRequestDTO requestDTO, @MappingTarget Promocao promocao);
}
