package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.NotificacaoRequestDTO;
import com.win.marketplace.dto.response.NotificacaoResponseDTO;
import com.win.marketplace.model.Notificacao;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificacaoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "lida", constant = "false")
    @Mapping(target = "dataLeitura", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    Notificacao toEntity(NotificacaoRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    NotificacaoResponseDTO toResponseDTO(Notificacao notificacao);

    List<NotificacaoResponseDTO> toResponseDTOList(List<Notificacao> notificacoes);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "lida", ignore = true)
    @Mapping(target = "dataLeitura", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    void updateEntityFromDTO(NotificacaoRequestDTO requestDTO, @MappingTarget Notificacao notificacao);
}
