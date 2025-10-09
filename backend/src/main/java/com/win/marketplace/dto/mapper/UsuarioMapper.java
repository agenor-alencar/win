package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.UsuarioCreateRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.model.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true) // Será criptografada no service
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "entregador", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    Usuario toEntity(RegisterRequestDTO requestDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true) // Será criptografada no service
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "entregador", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    Usuario toEntity(UsuarioCreateRequestDTO requestDTO);

    @Mapping(target = "perfis", expression = "java(getPerfis(usuario))")
    UsuarioResponseDTO toResponseDTO(Usuario usuario);

    List<UsuarioResponseDTO> toResponseDTOList(List<Usuario> usuarios);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senha", ignore = true)
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "entregador", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    void updateEntityFromDTO(RegisterRequestDTO requestDTO, @MappingTarget Usuario usuario);

    default List<String> getPerfis(Usuario usuario) {
        if (usuario.getUsuarioPerfis() != null) {
            return usuario.getUsuarioPerfis().stream()
                    .map(up -> up.getPerfil().getTipo().name())
                    .toList();
        }
        return List.of();
    }
}
