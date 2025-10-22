package com.win.marketplace.dto.mapper;

import com.win.marketplace.dto.request.RegisterRequestDTO;
import com.win.marketplace.dto.request.UsuarioCreateRequestDTO;
import com.win.marketplace.dto.response.UsuarioResponseDTO;
import com.win.marketplace.model.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface UsuarioMapper {

    /**
     * Converte RegisterRequestDTO para Usuario (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", ignore = true) // ✅ CORRIGIDO: senhaHash ao invés de senha_hash
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "criadoEm", ignore = true) // ✅ CORRIGIDO: criadoEm ao invés de dataCriacao
    @Mapping(target = "atualizadoEm", ignore = true) // ✅ CORRIGIDO: atualizadoEm ao invés de dataAtualizacao
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "motorista", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    Usuario toEntity(RegisterRequestDTO requestDTO);

    /**
     * Converte UsuarioCreateRequestDTO para Usuario (Entity)
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "ativo", constant = "true")
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "criadoEm", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "atualizadoEm", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "motorista", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    Usuario toEntity(UsuarioCreateRequestDTO requestDTO);

    /**
     * Converte Usuario (Entity) para UsuarioResponseDTO
     */
    @Mapping(target = "perfis", expression = "java(getPerfis(usuario))")
    UsuarioResponseDTO toResponseDTO(Usuario usuario);

    /**
     * Atualiza Usuario existente com dados do RegisterRequestDTO
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "senhaHash", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "ultimoAcesso", ignore = true)
    @Mapping(target = "criadoEm", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "atualizadoEm", ignore = true) // ✅ CORRIGIDO
    @Mapping(target = "enderecos", ignore = true)
    @Mapping(target = "pedidos", ignore = true)
    @Mapping(target = "avaliacoes", ignore = true)
    @Mapping(target = "notificacoes", ignore = true)
    @Mapping(target = "usuarioPerfis", ignore = true)
    @Mapping(target = "lojista", ignore = true)
    @Mapping(target = "motorista", ignore = true)
    @Mapping(target = "administrador", ignore = true)
    void updateEntityFromDTO(RegisterRequestDTO requestDTO, @MappingTarget Usuario usuario);

    /**
     * Extrai lista de nomes dos perfis do usuário
     */
    default List<String> getPerfis(Usuario usuario) {
        if (usuario.getUsuarioPerfis() != null && !usuario.getUsuarioPerfis().isEmpty()) {
            return usuario.getUsuarioPerfis().stream()
                    .map(up -> up.getPerfil().getNome()) // ✅ CORRIGIDO: usar getNome() ao invés de getTipo().name()
                    .collect(Collectors.toList());
        }
        return List.of();
    }
}
