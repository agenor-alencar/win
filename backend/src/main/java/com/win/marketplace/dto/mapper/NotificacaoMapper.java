package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.NotificacaoRequestDTO;
import com.win.marketplace.dto.response.NotificacaoResponseDTO;
import com.win.marketplace.model.Notificacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface NotificacaoMapper {

    /**
     * Converte NotificacaoRequestDTO para Notificacao (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "lida", constant = "false")
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "dataLeitura", ignore = true)
    Notificacao toEntity(NotificacaoRequestDTO requestDTO);

    /**
     * Converte Notificacao (Entity) para NotificacaoResponseDTO
     */
    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "nomeUsuario")
    NotificacaoResponseDTO toResponseDTO(Notificacao notificacao);

    /**
     * Atualiza Notificacao existente com dados do NotificacaoRequestDTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "criadoEm", ignore = true)
    @Mapping(target = "dataLeitura", ignore = true)
    void updateEntityFromDTO(NotificacaoRequestDTO requestDTO, @MappingTarget Notificacao notificacao);
}
