package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import org.mapstruct.*;

@Mapper(componentModel = "spring", imports = {UsuarioPerfilId.class})
public interface UsuarioPerfilMapper {

    /**
     * Converte UsuarioPerfilRequestDTO para UsuarioPerfil (Entity)
     */
    @Mapping(target = "id", expression = "java(new UsuarioPerfilId(requestDTO.usuarioId(), requestDTO.perfilId()))")
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "perfil", ignore = true)
    @Mapping(target = "dataAtribuicao", ignore = true)
    UsuarioPerfil toEntity(UsuarioPerfilRequestDTO requestDTO);

    /**
     * Converte UsuarioPerfil (Entity) para UsuarioPerfilResponseDTO
     */
    @Mapping(target = "usuarioId", source = "usuario.id")
    @Mapping(target = "nomeUsuario", source = "usuario.nome")
    @Mapping(target = "emailUsuario", source = "usuario.email")
    @Mapping(target = "perfilId", source = "perfil.id")
    @Mapping(target = "nomePerfil", source = "perfil.nome")
    @Mapping(target = "descricaoPerfil", source = "perfil.descricao")
    @Mapping(target = "dataAtribuicao", source = "dataAtribuicao")
    UsuarioPerfilResponseDTO toResponseDTO(UsuarioPerfil usuarioPerfil);

    /**
     * Atualiza UsuarioPerfil existente com dados do UsuarioPerfilRequestDTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    @Mapping(target = "perfil", ignore = true)
    @Mapping(target = "dataAtribuicao", ignore = true)
    void updateEntityFromDTO(UsuarioPerfilRequestDTO requestDTO, @MappingTarget UsuarioPerfil usuarioPerfil);
}
