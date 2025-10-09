package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.model.UsuarioPerfil;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioPerfilMapper {

    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "perfil", ignore = true)
    @Mapping(target = "dataAtribuicao", ignore = true)
    UsuarioPerfil toEntity(UsuarioPerfilRequestDTO requestDTO);

    @Mapping(source = "usuario.id", target = "usuarioId")
    @Mapping(source = "usuario.nome", target = "usuarioNome")
    @Mapping(source = "usuario.email", target = "usuarioEmail")
    @Mapping(source = "perfil.id", target = "perfilId")
    @Mapping(source = "perfil.tipo", target = "perfilTipo")
    @Mapping(source = "perfil.descricao", target = "perfilDescricao")
    UsuarioPerfilResponseDTO toResponseDTO(UsuarioPerfil usuarioPerfil);

    List<UsuarioPerfilResponseDTO> toResponseDTOList(List<UsuarioPerfil> usuarioPerfis);
}
