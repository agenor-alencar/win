package com.win.marketplace.service;

import com.win.marketplace.dto.request.UsuarioPerfilRequestDTO;
import com.win.marketplace.dto.response.UsuarioPerfilResponseDTO;
import com.win.marketplace.dto.mapper.UsuarioPerfilMapper;
import com.win.marketplace.model.UsuarioPerfil;
import com.win.marketplace.model.UsuarioPerfilId;
import com.win.marketplace.model.Usuario;
import com.win.marketplace.model.Perfil;
import com.win.marketplace.repository.UsuarioPerfilRepository;
import com.win.marketplace.repository.UsuarioRepository;
import com.win.marketplace.repository.PerfilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioPerfilService {

    private final UsuarioPerfilRepository usuarioPerfilRepository;
    private final UsuarioRepository usuarioRepository;
    private final PerfilRepository perfilRepository;
    private final UsuarioPerfilMapper usuarioPerfilMapper;

    public UsuarioPerfilResponseDTO atribuirPerfil(UsuarioPerfilRequestDTO requestDTO) {
        Usuario usuario = usuarioRepository.findById(requestDTO.usuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        Perfil perfil = perfilRepository.findById(requestDTO.perfilId())
                .orElseThrow(() -> new RuntimeException("Perfil não encontrado"));

        // Verificar se a associação já existe
        UsuarioPerfilId id = new UsuarioPerfilId(requestDTO.usuarioId(), requestDTO.perfilId());
        if (usuarioPerfilRepository.existsById(id)) {
            throw new RuntimeException("Usuário já possui este perfil");
        }

        UsuarioPerfil usuarioPerfil = usuarioPerfilMapper.toEntity(requestDTO);
        usuarioPerfil.setUsuario(usuario);
        usuarioPerfil.setPerfil(perfil);
        usuarioPerfil.setDataAtribuicao(OffsetDateTime.now());

        UsuarioPerfil savedUsuarioPerfil = usuarioPerfilRepository.save(usuarioPerfil);
        return usuarioPerfilMapper.toResponseDTO(savedUsuarioPerfil);
    }

    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorUsuario(UUID usuarioId) {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByUsuarioId(usuarioId);
        return usuarioPerfilMapper.toResponseDTOList(usuarioPerfis);
    }

    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorPerfil(UUID perfilId) {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByPerfilId(perfilId);
        return usuarioPerfilMapper.toResponseDTOList(usuarioPerfis);
    }

    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> buscarPorUsuarioETipo(UUID usuarioId, Perfil.TipoPerfil tipoPerfil) {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByUsuarioIdAndPerfilTipo(usuarioId, tipoPerfil);
        return usuarioPerfilMapper.toResponseDTOList(usuarioPerfis);
    }

    @Transactional(readOnly = true)
    public boolean usuarioPossuiPerfil(UUID usuarioId, Perfil.TipoPerfil tipoPerfil) {
        return usuarioPerfilRepository.existsByUsuarioIdAndPerfilTipo(usuarioId, tipoPerfil);
    }

    @Transactional(readOnly = true)
    public List<UsuarioPerfilResponseDTO> listarTodos() {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findAll();
        return usuarioPerfilMapper.toResponseDTOList(usuarioPerfis);
    }

    public void removerPerfil(UUID usuarioId, UUID perfilId) {
        UsuarioPerfilId id = new UsuarioPerfilId(usuarioId, perfilId);
        UsuarioPerfil usuarioPerfil = usuarioPerfilRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Associação usuário-perfil não encontrada"));

        usuarioPerfilRepository.delete(usuarioPerfil);
    }

    public void removerTodosPerfisUsuario(UUID usuarioId) {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByUsuarioId(usuarioId);
        usuarioPerfilRepository.deleteAll(usuarioPerfis);
    }

    public void removerTodosUsuariosPerfil(UUID perfilId) {
        List<UsuarioPerfil> usuarioPerfis = usuarioPerfilRepository.findByPerfilId(perfilId);
        usuarioPerfilRepository.deleteAll(usuarioPerfis);
    }
}
